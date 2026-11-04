// Lebensmittel-Datenbank: Richtwerte pro 100 g bzw. 100 ml
// Format: "Name|Alias|Alias ; kcal ; Fett ; Eiweiß ; Kohlenhydrate ; Portionsgrößen"
// Portionsgrößen (in g/ml): st=Stück sc=Scheibe el=Esslöffel tl=Teelöffel gl=Glas ta=Tasse
// be=Becher po=Portion hv=Handvoll ku=Kugel fl=Flasche do=Dose m=Menge bei "mit …" ohne Mengenangabe
// Kohlenhydrate nach EU-Kennzeichnung (ohne Ballaststoffe).
// Gebratenes/Salate OHNE Brat- bzw. Salatöl – das Öl wird separat eingetragen.
const FOOD_DATA = `
Vollkornbrot|Schwarzbrot|Roggenvollkornbrot|Roggenbrot;215;1.2;7;41;sc=50
Mischbrot|Brot|Graubrot|Bauernbrot|Sauerteigbrot;230;1.1;6.5;47;sc=45
Dinkelbrot|Dinkelvollkornbrot;230;2;8;44;sc=50
Eiweißbrot|Low-Carb-Brot|Proteinbrot|Eiweissbrot;260;11;23;8;sc=45
Toastbrot|Toast|Weizentoast;260;4;8;47;sc=25
Vollkorntoast;245;4;9;42;sc=28
Weißbrot|Baguette|Ciabatta;260;1.5;8.5;52;sc=30
Pumpernickel;190;1;6;37;sc=40
Knäckebrot;340;2;10;66;sc=10;st=10
Brötchen|Semmel|Schrippe|Weizenbrötchen|Weckle|Wecken;270;1.5;9;55;st=55
Vollkornbrötchen|Dinkelbrötchen;240;2.5;9;44;st=60
Körnerbrötchen|Mehrkornbrötchen|Kürbiskernbrötchen;280;7;10;43;st=70
Laugenbrezel|Brezel|Brezn|Laugenbrötchen|Laugenstange;270;2;8;55;st=80
Croissant|Hörnchen;410;22;8;44;st=60
Zwieback;400;5;10;75;st=10
Reiswaffel|Reiswaffeln;385;3;8;80;st=8
Haferflocken|Haferflocke|Porridge-Haferflocken;370;7;13.5;59;el=10;po=50
Müsli|Früchtemüsli|Bircher Müsli;360;6;9;64;po=50;el=12
Granola|Knuspermüsli|Crunchy Müsli|Schokomüsli;450;17;9;63;po=45;el=12
Cornflakes;380;1;7;84;po=30
Haferbrei|Porridge|Overnight Oats;110;3;4;16;po=250
Chiasamen|Chia;490;31;17;8;el=12;tl=5;m=10
Leinsamen;490;31;24;2;el=10;tl=4;m=10
Reis|Reis gekocht|gekochter Reis|Basmatireis|Jasminreis|Langkornreis;130;0.3;2.7;28.5;po=180;ta=150
Reis roh|Reis ungekocht|Trockenreis;350;0.6;7;78;po=70
Vollkornreis|Naturreis;125;1;2.7;25;po=180
Nudeln|Pasta|Spaghetti|Penne|Fusilli|Tagliatelle|Makkaroni|Nudeln gekocht|Bandnudeln;150;0.9;5.5;30;po=220
Nudeln roh|Nudeln ungekocht|Spaghetti roh;355;1.5;12.5;70;po=80
Vollkornnudeln;140;1;6;26;po=220
Spätzle;160;2;6;29;po=200
Gnocchi;140;0.5;3.5;30;po=250
Kartoffeln|Kartoffel|Salzkartoffeln|Pellkartoffeln|Salzkartoffel|Pellkartoffel|Ofenkartoffel;72;0.1;2;15;st=80;po=200
Bratkartoffeln (ohne Bratfett)|Bratkartoffeln;80;0.1;2.2;17;po=200
Pommes|Pommes frites|Fritten;290;15;3.5;35;po=150
Kartoffelpüree|Kartoffelbrei|Püree|Kartoffelpüree;90;3.5;2;13;po=200
Kartoffelsalat;130;7;1.8;14;po=200
Nudelsalat;170;9;4;18;po=200
Quinoa;120;1.9;4.4;21;po=180
Couscous;112;0.2;3.8;23;po=180
Bulgur;85;0.3;3;18;po=180
Linsen|Linsen gekocht;116;0.4;9;17;po=200
Kichererbsen;120;2.5;7;16;po=150;do=240
Kidneybohnen|weiße Bohnen|Bohnen aus der Dose;100;0.5;7;14;po=150;do=250
Tofu;120;7;13;1;po=150
Milch|Vollmilch|Kuhmilch;64;3.5;3.3;4.8;gl=200;ta=150;m=30;el=15
Fettarme Milch|Milch 1,5|fettarme Milch|teilentrahmte Milch;47;1.5;3.4;4.9;gl=200;ta=150;m=30;el=15
Hafermilch|Haferdrink|Hafer Drink;45;1.5;0.5;6.7;gl=200;ta=150;m=30
Sojamilch|Sojadrink;40;1.8;3.3;2.5;gl=200;ta=150;m=30
Mandelmilch|Mandeldrink;24;1.1;0.5;3;gl=200;ta=150;m=30
Kondensmilch|Kaffeesahne|Dosenmilch;133;7.5;6.5;9.5;m=10;tl=5;el=15
Joghurt|Naturjoghurt|Jogurt|Joghurt 3,5;66;3.5;3.8;4.7;be=150;el=20;m=50
Fettarmer Joghurt|Joghurt 1,5|fettarmer Jogurt|Joghurt light;48;1.5;4;4.8;be=150;el=20;m=50
Griechischer Joghurt|Griechischer Jogurt|Joghurt griechisch;120;10;4.5;3.6;be=150;el=20;m=50
Fruchtjoghurt|Erdbeerjoghurt|Kirschjoghurt;95;3;3.5;13;be=150
Skyr|Skür|Sküür|Schkür|Skier|Skir|Skyr natur;63;0.2;11;4;be=150;el=20;m=50
Magerquark|Quark|Speisequark mager;67;0.3;12;4;el=30;po=125;be=250;m=50
Quark 20|Speisequark 20|Speisequark;109;5;12;3.5;el=30;po=125;be=250;m=50
Quark 40|Sahnequark;160;11;11;3;el=30;po=125;be=250;m=50
Kräuterquark;130;7;9;4;el=30;m=50
Hüttenkäse|körniger Frischkäse|Cottage Cheese;100;4.5;12.5;2.6;be=200;el=25;m=50
Frischkäse|Philadelphia|Doppelrahmfrischkäse;245;22;6;3.5;el=20;tl=8;m=20
Frischkäse light|leichter Frischkäse;150;10.5;8;4.5;el=20;tl=8;m=20
Käse (Schnittkäse)|Käse|Gouda|Scheibenkäse|Butterkäse|Tilsiter|Edamer;356;28;25;0;sc=25;m=25;st=25
Emmentaler|Bergkäse|Hartkäse|Allgäuer;380;30;28;0;sc=25;m=25
Leerdammer|Maasdamer;350;27;27;0;sc=25;m=25
Mozzarella;255;19;19;1;st=125;sc=25;m=30
Feta|Schafskäse|Hirtenkäse|Weißkäse;260;21;16;0.5;po=50;m=30
Parmesan|Grana Padano|Hartkäse gerieben|Reibekäse;400;29;35;0;el=6;m=10
Camembert|Brie;300;24;20;0;st=30;m=30
Harzer Käse|Harzer|Handkäse;115;0.7;27;0;st=25;m=30
Halloumi;320;25;22;2;po=100;sc=30
Butter;740;83;0.7;0.6;tl=5;el=12;m=8
Margarine|Halbfettbutter;720;80;0.2;0.4;tl=5;el=12;m=8
Sahne|Schlagsahne|Schlagobers;310;32;2.4;3.2;el=15;m=20;po=30
Saure Sahne;115;10;3;3.6;el=15;m=20
Schmand;240;24;2.5;3.4;el=15;m=20
Crème fraîche|Creme fraiche;300;30;2.5;2.5;el=15;m=20
Ei|Eier|Hühnerei|gekochtes Ei|Frühstücksei|hartes Ei|weiches Ei|Hühnereier;145;10;12.5;0.7;st=58
Rührei (ohne Bratfett)|Rührei|Rühreier;145;10;12.5;0.8;po=120
Spiegelei (ohne Bratfett)|Spiegelei|Spiegeleier;145;10;12.5;0.7;st=58
Omelett (ohne Bratfett)|Omelett|Omelette;145;10;12.5;0.8;st=130
Hähnchenbrust|Hühnerbrust|Hähnchenbrustfilet|Hähnchenfilet|Hähnchen|Huhn|Hühnchen|Hühnerfleisch|Chicken;110;1.5;23.5;0;po=150;st=150
Hähnchenschenkel|Hähnchenkeule|Hühnerschenkel|Chicken Wings;190;12;19;0;st=150
Putenbrust|Pute|Putenschnitzel|Putenfleisch|Truthahn;105;1;24;0;po=150;st=150
Hackfleisch|Hack|gemischtes Hack|Gehacktes;260;21;18;0;po=125
Rinderhack|Rinderhackfleisch;250;20;18;0;po=125
Rindersteak|Steak|Rinderfilet|Rindfleisch|Hüftsteak|Rumpsteak;125;4;21;0;po=200;st=200
Schweineschnitzel|Schnitzel|Schweinefleisch|Schweinefilet|Kotelett|Schweinesteak;110;2;22;0;po=150;st=150
Wiener Schnitzel (ohne Bratfett)|Wiener Schnitzel|paniertes Schnitzel|Schnitzel paniert;165;4;20;11;st=150
Frikadelle|Bulette|Fleischpflanzerl|Fleischküchle|Frikadellen|Hackfleischbällchen;240;16;15;8;st=80
Bratwurst|Rostbratwurst|Nürnberger;300;26;14;1;st=120
Wiener Würstchen|Wiener|Würstchen|Frankfurter|Bockwurst|Wienerle;270;24;13;0.5;st=50
Leberwurst|Leberpastete;330;30;13;1;m=20;sc=20
Salami|Mortadella|Fleischwurst|Lyoner;380;32;22;1;sc=8;m=20
Schinken|Kochschinken|gekochter Schinken|Hinterschinken;110;3.5;19;1;sc=25;m=25
Rohschinken|Schinken roh|Serrano|Parmaschinken|Schwarzwälder Schinken|Katenschinken;230;12;30;0.5;sc=15;m=20
Putenaufschnitt|Putenbrust Aufschnitt|Geflügelaufschnitt|Hähnchenbrustaufschnitt;105;2;21;1;sc=20;m=20
Speck|Bacon|Frühstücksspeck;400;38;13;0;sc=10;m=20
Kassler|Kasseler|Kasselerbraten|Kassler Braten|Kasslerkotelett|Kassler Kotelett|Kasseler Kotelett;140;7;19;0.5;po=150;sc=60;st=150
Kassleraufschnitt|Kasseler Aufschnitt|Kassler Aufschnitt;110;4;18;1;sc=20;m=25
Schweinebraten|Krustenbraten|Schweinshaxe|Schweinenacken|Nackensteak;190;11;23;0;po=150;sc=60
Rinderbraten|Sauerbraten|Tafelspitz;150;6;23;2;po=150;sc=60
Rinderroulade|Roulade|Rouladen;160;9;17;3;st=180
Weißwurst|Weisswurst;280;25;11;0.5;st=80
Fleischsalat;300;28;7;4;el=30;po=100;m=50
Eiersalat;200;17;8;2;el=30;po=100;m=50
Leberkäse|Fleischkäse;300;27;12;1;sc=100;st=100
Gulasch|Rindergulasch;130;7;15;2;po=250
Chili con Carne|Chili;110;4.5;8;9;po=350
Döner|Döner Kebab|Kebab|Dönerkebab;230;11;12;22;st=350
Currywurst;220;15;9;12;po=200;st=200
Hamburger|Burger|Cheeseburger;250;11;13;26;st=200
Lachs|Lachsfilet;200;13.5;20;0;po=125;st=125
Räucherlachs|geräucherter Lachs|Graved Lachs;180;10;22;0;sc=20;m=30;po=50
Thunfisch|Thunfisch Dose;110;1;25;0;do=150;po=150;m=50
Forelle|Räucherforelle;110;4;20;0;po=125;st=125
Fischfilet|Kabeljau|Seelachs|Dorsch|Pangasius|Rotbarsch|Scholle;80;0.7;18;0;po=150;st=150
Fischstäbchen (ohne Bratfett)|Fischstäbchen;185;8;13;16;st=30
Garnelen|Shrimps|Krabben|Scampi|Krevetten;80;1;18;0;po=100
Matjes|Hering|Bismarckhering|Rollmops;220;17;16;1;st=60
Tomate|Tomaten|Cocktailtomaten|Kirschtomaten|Cherrytomaten;18;0.2;0.9;2.6;st=80;po=150
Gurke|Salatgurke|Gurken|Gewürzgurke|Essiggurke;13;0.2;0.6;1.8;st=300;sc=5;po=100
Paprika|Paprikaschote;30;0.3;1;5;st=150
Karotte|Möhre|Möhren|Karotten|Mohrrübe|Mohrrüben|Rüebli;36;0.2;1;7;st=80;po=150
Brokkoli|Broccoli;34;0.4;3.5;2.7;po=200
Blumenkohl;25;0.3;2.5;2.3;po=200
Rosenkohl;43;0.3;4.5;3.3;po=200
Zucchini;20;0.4;1.5;2;st=200;po=200
Aubergine|Auberginen;20;0.2;1.2;2.5;st=300;po=200
Spinat|Blattspinat|Rahmspinat;23;0.4;2.9;0.6;po=200
Salat|Blattsalat|Kopfsalat|grüner Salat|Eisbergsalat|Feldsalat|Römersalat|Salatblätter;14;0.2;1.2;1.5;po=80;hv=20
Gemischter Salat (ohne Dressing)|Gemischter Salat|Salatteller|Beilagensalat;17;0.2;1.2;2.5;po=200
Rucola;25;0.7;2.6;2;po=40;hv=20
Zwiebel|Zwiebeln|Röstzwiebeln;28;0.2;1.2;5;st=80;el=10;m=20
Champignons|Pilze|Pfifferlinge|Champignon;22;0.3;3;0.6;po=150;st=15
Mais|Zuckermais|Maiskolben;85;1.2;2.5;15;el=20;po=140;do=140;st=200
Erbsen|Erbsen grün;80;0.5;6;12;po=150;el=20
Grüne Bohnen|Bohnen|Brechbohnen|Prinzessbohnen;30;0.2;2;5;po=200
Rotkohl|Rotkraut|Blaukraut;29;0.2;1.5;3.5;po=200
Weißkohl|Kohl|Krautsalat|Wirsing;25;0.2;1.4;4;po=200
Sauerkraut;17;0.3;1.5;1;po=200
Spargel;18;0.2;2;2;po=300;st=20
Kürbis|Hokkaido;26;0.1;1;5;po=200
Rote Bete|Rote Beete;42;0.1;1.5;8;st=100;po=150
Kohlrabi;24;0.2;1.9;3.7;st=250
Lauch|Porree;24;0.3;2.2;3.3;st=200;po=150
Sellerie|Staudensellerie;18;0.2;1.2;2.2;st=40;po=100
Avocado;180;17;2;3.6;st=150
Oliven;140;13.5;1;1.5;st=4;hv=30;m=20
Gemüse (ohne Öl)|Gemüse|Mischgemüse|Gemüsepfanne|Ofengemüse|Wokgemüse;30;0.3;2;5;po=200
Apfel|Äpfel;54;0.2;0.3;11.5;st=150
Banane|Bananen;93;0.2;1.1;20;st=120
Orange|Apfelsine|Orangen;45;0.2;1;9;st=180
Mandarine|Clementine|Mandarinen|Clementinen;50;0.3;0.7;10;st=70
Birne|Birnen;55;0.3;0.5;12;st=160
Erdbeeren|Erdbeere;32;0.4;0.8;5.5;st=12;po=150;hv=60;m=50
Heidelbeeren|Blaubeeren|Heidelbeere|Blaubeere;44;0.6;0.6;7.5;po=125;hv=50;el=15;m=50
Himbeeren|Himbeere|Brombeeren;34;0.3;1.3;4.8;po=125;hv=50;el=15;m=50
Beeren|Beerenmischung|Waldbeeren|Johannisbeeren;40;0.4;1;6.5;po=125;hv=50;el=15;m=50
Weintrauben|Trauben|Weintraube;70;0.3;0.7;15.5;po=125;st=5;hv=60
Kiwi;52;0.6;1;9;st=75
Ananas;55;0.2;0.5;12;po=150;sc=80
Mango;62;0.4;0.6;13;st=300;po=150
Pfirsich|Nektarine|Aprikose|Aprikosen|Pfirsiche;42;0.1;0.8;9;st=130
Pflaume|Pflaumen|Zwetschge|Zwetschgen|Zwetschen;47;0.2;0.6;10;st=35
Kirschen|Kirsche;63;0.3;1;13;po=150;st=6
Wassermelone|Melone;30;0.2;0.6;7;po=250;sc=250
Honigmelone|Cantaloupe;55;0.1;0.9;12;po=250;sc=200
Grapefruit|Pampelmuse;38;0.1;0.6;7.5;st=250
Zitrone|Zitronensaft|Limette;30;0.3;0.7;3;st=60;el=15;m=5
Rosinen|Sultaninen;300;0.6;2.5;66;el=10;hv=30
Datteln|Dattel;290;0.5;2;65;st=8
Trockenobst|Trockenfrüchte|getrocknete Aprikosen|Trockenpflaumen|Feigen;250;0.5;2.5;55;st=8;hv=30
Obstsalat;55;0.2;0.6;12;po=150
Apfelmus|Apfelmark;75;0.1;0.3;17;el=20;po=100;m=50
Walnüsse|Walnuss|Walnusskerne;670;63;15;7;st=5;hv=30;el=8
Mandeln|Mandel;580;52;24;5.7;st=1.2;hv=25;el=8
Haselnüsse|Haselnuss;650;62;14;6;st=1.5;hv=25;el=8
Erdnüsse|Erdnuss|Erdnüsse geröstet;590;49;25;10;hv=30;el=10
Cashews|Cashewkerne|Cashewnüsse;580;46;18;27;hv=30;el=10
Nüsse|Nussmischung|Nusskerne|Pistazien|Paranüsse;620;55;18;10;hv=30;el=8
Studentenfutter;470;30;13;37;hv=30;po=50
Kürbiskerne|Sonnenblumenkerne|Kerne;570;46;29;6;el=10;hv=30;m=10
Erdnussbutter|Erdnussmus|Erdnusscreme|Mandelmus;620;50;25;13;el=15;tl=7;m=15
Marmelade|Konfitüre|Gelee|Fruchtaufstrich;250;0.1;0.4;60;tl=8;el=20;m=20
Honig;310;0;0.4;76;tl=8;el=20;m=10
Nutella|Nuss-Nougat-Creme|Nougatcreme|Schokocreme;540;31;6;57;tl=8;el=20;m=15
Zucker|Würfelzucker|Rohrzucker;400;0;0;100;tl=4;el=12;st=3;m=5
Süßstoff|Süßungsmittel;0;0;0;0;st=1;m=1
Schokolade|Vollmilchschokolade|Milchschokolade;535;30;7;57;st=5;po=25
Zartbitterschokolade|dunkle Schokolade|Bitterschokolade|Zartbitter;560;40;8;36;st=5;po=25
Pralinen|Praline|Schokoriegel|Riegel Schokolade;500;27;6;58;st=12
Kuchen|Rührkuchen|Marmorkuchen|Napfkuchen|Gugelhupf;400;20;6;50;st=80
Obstkuchen|Apfelkuchen|Pflaumenkuchen|Zwetschgenkuchen|Erdbeerkuchen;200;7;3;30;st=120
Käsekuchen|Quarkkuchen;240;12;8;25;st=120
Torte|Sahnetorte|Schwarzwälder Kirschtorte;300;19;4;28;st=130
Kekse|Butterkekse|Plätzchen|Keks|Cookies|Kekse Butter;450;15;7.5;73;st=8;po=30
Lebkuchen|Spekulatius|Printen;400;10;6;70;st=25
Gummibärchen|Fruchtgummi|Haribo|Gummibärchen;340;0.2;7;77;st=2;hv=25;po=25
Eis|Speiseeis|Eiscreme|Speiseeis Vanille|Eiskugel;210;11;3.5;24;ku=50;st=50;po=100
Chips|Kartoffelchips;540;34;6;52;hv=25;po=30
Salzstangen|Salzbrezeln|Cracker;380;3;10;75;hv=25;po=30
Müsliriegel|Proteinriegel|Riegel|Getreideriegel;410;13;6;65;st=25
Pudding|Vanillepudding|Schokopudding|Grießbrei|Milchreis;110;3;3.3;17;be=125;po=150
Berliner|Krapfen|Pfannkuchen Berliner|Donut;360;15;6.5;48;st=70
Pfannkuchen (ohne Bratfett)|Pfannkuchen|Eierkuchen|Crêpe|Crepe|Palatschinken|Pancakes;175;5;8;24;st=80
Waffel|Waffeln;380;20;6;44;st=40
Kaffee|Kaffee schwarz|Espresso|Filterkaffee|schwarzer Kaffee;2;0;0.2;0.3;ta=150;be=250
Cappuccino;40;2;2;3;ta=200;be=300
Milchkaffee|Latte Macchiato|Latte|Café au lait|Flat White;50;2.5;2.5;3.7;ta=250;gl=300;be=300
Tee|Kräutertee|Früchtetee|schwarzer Tee|grüner Tee|Pfefferminztee;1;0;0;0.2;ta=200;be=300
Kakao|Kakaogetränk|heiße Schokolade|Trinkschokolade;80;3.3;3.5;9;ta=250;be=300
Wasser|Mineralwasser|Sprudel|Leitungswasser;0;0;0;0;gl=250;fl=500
Orangensaft|O-Saft|Orangen Saft|Multivitaminsaft;45;0.1;0.7;9;gl=200
Apfelsaft;46;0;0.1;11;gl=200
Apfelschorle|Saftschorle|Schorle|Johannisbeerschorle;24;0;0;5.5;gl=250;fl=500
Cola|Coca-Cola|Coca Cola;42;0;0;10.6;gl=250;fl=500;do=330
Cola Zero|Cola light|Coke Zero|Pepsi light|Limonade zero;0.3;0;0;0;gl=250;fl=500;do=330
Limonade|Fanta|Sprite|Limo|Eistee;40;0;0;10;gl=250;fl=500;do=330
Smoothie;55;0.3;0.7;12;fl=250;gl=200
Bier|Pils|Weizenbier|Weißbier|Helles;42;0;0.4;3;gl=330;fl=500;do=500
Alkoholfreies Bier|Bier alkoholfrei|Radler;25;0;0.3;5;gl=330;fl=500
Wein|Rotwein|Weißwein|Rosé|Weinschorle;70;0;0.1;2;gl=200
Sekt|Prosecco|Champagner|Crémant;80;0;0.2;4;gl=100
Proteinpulver|Eiweißpulver|Proteinshake|Eiweißshake|Whey;380;6;78;5;po=30;el=10
Spaghetti Bolognese|Nudeln Bolognese|Bolognese;140;5;7;17;po=400
Bolognesesauce|Bolognese Soße|Hackfleischsoße;110;7;8;4;po=150;m=150
Lasagne;150;7.5;7.5;13;po=350;st=350
Pizza|Pizza Margherita|Margherita;240;9;10;30;st=350;po=350
Salamipizza|Pizza Salami|Pizza Schinken|Pizza Tonno;260;11;11;29;st=380;po=380
Sushi|Maki|Nigiri;145;2;6;27;st=30;po=250
Hühnersuppe|Hühnerbrühe|Nudelsuppe;35;1.5;3;2.5;po=300;ta=250;te=300
Gemüsesuppe|Suppe|Minestrone|Gemüsebrühe;35;1.5;1.2;4;po=300;ta=250
Brühe|Fleischbrühe|Bouillon;5;0.3;0.5;0.3;po=250;ta=250
Linsensuppe|Linseneintopf|Linsen Eintopf;80;2;5;10;po=350
Erbsensuppe|Erbseneintopf|Bohneneintopf|Eintopf;85;2.5;5;10;po=350
Kartoffelsuppe;70;3;2;8;po=350
Tomatensuppe;45;1.5;1;7;po=300
Kürbissuppe|Cremesuppe;55;3;1;6;po=300
Curry|Hähnchen Curry|Hühnchen Curry|Chicken Curry|Gemüsecurry;130;6;10;8;po=350
Ravioli|Ravioli Dose|Tortellini;85;2.5;3;12;po=400
Maultaschen|Maultasche;170;6;8;21;st=60;po=250
Kaiserschmarrn (ohne Bratfett)|Kaiserschmarrn;190;6.5;7.5;26;po=300
Wrap|Tortilla Wrap;220;6;8;34;st=250
Sandwich|Belegtes Brötchen|Käsebrötchen|Schinkenbrötchen;240;9;11;28;st=150
Toast Hawaii;210;9;12;20;st=150
Öl (Oliven-, Raps-, Sonnenblumenöl …)|Öl|Olivenöl|Rapsöl|Sonnenblumenöl|Speiseöl|Leinöl|Kokosöl;880;99.8;0;0;el=10;tl=4;m=10
Mayonnaise|Mayo|Remoulade;680;75;1;3;el=15;tl=5;m=15
Ketchup|Tomatenketchup|Curryketchup;100;0.1;1.2;23;el=15;tl=5;m=15
Senf;70;4;6;2;tl=5;el=12;m=5
Salatdressing|Dressing|Salatsoße|Vinaigrette|Joghurtdressing;300;30;0.5;7;el=15;m=20
Pesto;450;45;5;5;el=15;tl=5;m=20
Tomatensauce|Tomatensoße|Tomatensoße|Passata|Tomatenmark;45;1.5;1.5;6;po=150;el=15;m=100
Soße|Sauce|Bratensoße|Bratensauce|Rahmsoße|Jägersoße|Bratensaft;60;4;1;4;po=80;el=15;m=50
Hollandaise|Sauce Hollandaise;450;47;1;5;el=15;m=50
Hummus|Humus;250;20;7;9;el=20;m=30
Tzatziki|Zaziki;110;9;4;3;el=20;m=40
`;
