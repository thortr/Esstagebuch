package de.thortr.esstagebuch;

import android.app.Activity;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.speech.RecognizerIntent;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import org.json.JSONArray;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.Locale;

/**
 * Esstagebuch als eigenständige Android-App.
 * Die Web-Oberfläche liegt in assets/www. Alle Daten werden zusätzlich als Dateien im
 * privaten App-Speicher abgelegt (nicht im Browser-Speicher). Aufräum-Apps, die den
 * Cache bzw. Browserdaten löschen, erreichen diese Dateien nicht.
 * Außerdem wird pro Tag eine Kopie der Daten aufbewahrt (die letzten 60 Tage).
 */
public class MainActivity extends Activity {

    private static final int REQ_SPEECH = 1;
    private static final int REQ_FILE = 2;
    private static final int KEEP_BACKUPS = 60;

    private WebView web;
    private ValueCallback<Uri[]> fileCallback;
    private volatile Uri lastExport;
    private volatile String lastExportMime = "text/csv";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE);

        web = new WebView(this);
        setContentView(web);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowFileAccessFromFileURLs(true);
        s.setAllowUniversalAccessFromFileURLs(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setTextZoom(100);

        web.addJavascriptInterface(new Bridge(), "Android");

        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri u = request.getUrl();
                String scheme = u.getScheme() == null ? "" : u.getScheme();
                if (scheme.equals("file")) return false;
                try {
                    if (scheme.equals("mailto")) startActivity(new Intent(Intent.ACTION_SENDTO, u));
                    else startActivity(new Intent(Intent.ACTION_VIEW, u));
                } catch (Exception ignored) { }
                return true;
            }
        });

        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = callback;
                Intent i = new Intent(Intent.ACTION_GET_CONTENT);
                i.addCategory(Intent.CATEGORY_OPENABLE);
                i.setType("*/*");
                try {
                    startActivityForResult(Intent.createChooser(i, "Datei wählen"), REQ_FILE);
                } catch (Exception e) {
                    fileCallback = null;
                    return false;
                }
                return true;
            }
        });

        web.loadUrl("file:///android_asset/www/index.html");
    }

    private void js(final String code) {
        runOnUiThread(() -> web.evaluateJavascript(code, null));
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == REQ_SPEECH) {
            ArrayList<String> res = (resultCode == RESULT_OK && data != null)
                    ? data.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS) : null;
            if (res != null && !res.isEmpty()) {
                js("window.__androidSpeech && window.__androidSpeech(" + new JSONArray(res).toString() + ")");
            } else {
                js("window.__androidSpeechEnd && window.__androidSpeechEnd()");
            }
        } else if (requestCode == REQ_FILE) {
            if (fileCallback != null) {
                Uri[] r = (resultCode == RESULT_OK && data != null && data.getData() != null)
                        ? new Uri[]{data.getData()} : null;
                fileCallback.onReceiveValue(r);
                fileCallback = null;
            }
        }
    }

    @Override
    public void onBackPressed() {
        web.evaluateJavascript("(window.__back && window.__back()) ? 'ja' : 'nein'", value -> {
            if (value == null || !value.contains("ja")) MainActivity.super.onBackPressed();
        });
    }

    @Override
    protected void onPause() {
        // Unfertige Eingabe automatisch eintragen, bevor die App in den Hintergrund geht
        if (web != null) web.evaluateJavascript("window.__androidPause && window.__androidPause()", null);
        super.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (web != null) web.evaluateJavascript("window.__androidResume && window.__androidResume()", null);
    }

    /* ---------------- Dateien im privaten App-Speicher ---------------- */

    private File kvDir() {
        File d = new File(getFilesDir(), "daten");
        if (!d.exists()) d.mkdirs();
        return d;
    }

    private File backupDir() {
        File d = new File(getFilesDir(), "tageskopien");
        if (!d.exists()) d.mkdirs();
        return d;
    }

    private static String safe(String key) {
        return key.replaceAll("[^A-Za-z0-9_.-]", "_");
    }

    private static String readFile(File f) {
        if (!f.exists()) return "";
        try (FileInputStream in = new FileInputStream(f)) {
            byte[] buf = new byte[(int) f.length()];
            int off = 0;
            while (off < buf.length) {
                int n = in.read(buf, off, buf.length - off);
                if (n < 0) break;
                off += n;
            }
            return new String(buf, 0, off, StandardCharsets.UTF_8);
        } catch (Exception e) {
            return "";
        }
    }

    /** Sicher schreiben: erst in eine Hilfsdatei, dann umbenennen (nie halb geschriebene Daten). */
    private static boolean writeFile(File f, String content) {
        File tmp = new File(f.getParentFile(), f.getName() + ".tmp");
        try (FileOutputStream out = new FileOutputStream(tmp)) {
            out.write(content.getBytes(StandardCharsets.UTF_8));
            out.getFD().sync();
        } catch (Exception e) {
            return false;
        }
        return tmp.renameTo(f);
    }

    private void dailyCopy(String content) {
        String day = new SimpleDateFormat("yyyy-MM-dd", Locale.GERMANY).format(new Date());
        File f = new File(backupDir(), "esstagebuch-" + day + ".json");
        // Eine Tageskopie nie durch einen deutlich kleineren Stand ersetzen (Schutz, falls Daten verloren gingen)
        if (f.exists() && content.length() < f.length() * 0.7) {
            f = new File(backupDir(), "esstagebuch-" + day + "-b.json");
        }
        writeFile(f, content);
        File[] all = backupDir().listFiles((dir, name) -> name.endsWith(".json"));
        if (all != null && all.length > KEEP_BACKUPS) {
            Arrays.sort(all, (a, b) -> a.getName().compareTo(b.getName()));
            for (int i = 0; i < all.length - KEEP_BACKUPS; i++) all[i].delete();
        }
    }

    /* ---------------- Brücke für die Web-Oberfläche ---------------- */

    private class Bridge {

        @JavascriptInterface
        public String kvGet(String key) {
            return readFile(new File(kvDir(), safe(key)));
        }

        @JavascriptInterface
        public boolean kvSet(String key, String value) {
            boolean ok = writeFile(new File(kvDir(), safe(key)), value == null ? "" : value);
            if (ok && "esstagebuch_v1".equals(key) && value != null && value.length() > 2) dailyCopy(value);
            return ok;
        }

        @JavascriptInterface
        public void kvRemove(String key) {
            new File(kvDir(), safe(key)).delete();
        }

        @JavascriptInterface
        public String listBackups() {
            File[] all = backupDir().listFiles((dir, name) -> name.endsWith(".json"));
            JSONArray arr = new JSONArray();
            if (all != null) {
                Arrays.sort(all, (a, b) -> b.getName().compareTo(a.getName()));
                for (File f : all) arr.put(f.getName());
            }
            return arr.toString();
        }

        @JavascriptInterface
        public String readBackup(String name) {
            return readFile(new File(backupDir(), safe(name)));
        }

        @JavascriptInterface
        public boolean hasSpeech() {
            return !getPackageManager().queryIntentActivities(
                    new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH), 0).isEmpty();
        }

        @JavascriptInterface
        public void startSpeech() {
            runOnUiThread(() -> {
                Intent i = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
                i.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
                i.putExtra(RecognizerIntent.EXTRA_LANGUAGE, "de-DE");
                i.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 5);
                i.putExtra(RecognizerIntent.EXTRA_PROMPT, "Was hast du gegessen?");
                try {
                    startActivityForResult(i, REQ_SPEECH);
                } catch (Exception e) {
                    js("window.__androidSpeechEnd && window.__androidSpeechEnd('nicht verfügbar')");
                }
            });
        }

        /** Datei in „Downloads“ ablegen. Rückgabe „ok“ oder Fehlertext. */
        @JavascriptInterface
        public String exportFile(String name, String mime, String content) {
            try {
                ContentResolver cr = getContentResolver();
                ContentValues v = new ContentValues();
                v.put(MediaStore.MediaColumns.DISPLAY_NAME, name);
                v.put(MediaStore.MediaColumns.MIME_TYPE, mime);
                v.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);
                Uri uri = cr.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, v);
                if (uri == null) return "Datei konnte nicht angelegt werden";
                try (OutputStream out = cr.openOutputStream(uri)) {
                    if (out == null) return "Datei konnte nicht geschrieben werden";
                    out.write(content.getBytes(StandardCharsets.UTF_8));
                }
                lastExport = uri;
                lastExportMime = mime;
                return "ok";
            } catch (Exception e) {
                return "Fehler: " + e.getMessage();
            }
        }

        /** Zuletzt exportierte Datei teilen (E-Mail, Drive, Excel …). */
        @JavascriptInterface
        public void shareLast(String title) {
            final Uri uri = lastExport;
            if (uri == null) return;
            runOnUiThread(() -> {
                Intent send = new Intent(Intent.ACTION_SEND);
                send.setType(lastExportMime);
                send.putExtra(Intent.EXTRA_STREAM, uri);
                send.putExtra(Intent.EXTRA_SUBJECT, title);
                send.setClipData(ClipData.newRawUri(title, uri));
                send.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                try {
                    startActivity(Intent.createChooser(send, "Teilen / Öffnen mit …"));
                } catch (Exception ignored) { }
            });
        }

        @JavascriptInterface
        public void copy(String text) {
            ClipboardManager cm = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
            if (cm != null) cm.setPrimaryClip(ClipData.newPlainText("Esstagebuch", text));
        }

        @JavascriptInterface
        public String info() {
            String v = "?";
            try {
                v = getPackageManager().getPackageInfo(getPackageName(), 0).versionName;
            } catch (Exception ignored) { }
            return "Android-App " + v + " · Android " + Build.VERSION.RELEASE + " · " + Build.MANUFACTURER + " " + Build.MODEL;
        }
    }
}
