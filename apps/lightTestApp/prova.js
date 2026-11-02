// Scenario di prova di lightTestApp: bash strumenti/prova.sh apps/lightTestApp

var r = avvia(app, 'lightTestApp');
verifica(r.draw && r.draw.update_type === 'gc4', 'all\'apertura disegna lo schermo intero');
verifica(r.move && r.move.h === 270 && r.move.m === 90, 'lancette orizzontali');
verifica(r.draw.lightTestApp.layout_info.r1 === 'LUCE OFF', 'parte con la luce spenta');
verifica(r.draw.lightTestApp.layout_info.r2 === 'uscita: menu', 'parte con l\'uscita al menu');
verifica(r.draw.lightTestApp.layout_info.inverti === false, 'parte con lo sfondo nero');

r = premi(app, 'top_short_press_release');
verifica(conta(r, 'double_tap') === 1, 'in alto: accende e manda subito un doppio tocco');
verifica(SIM.timer.luce === 2000, 'timer della luce a 2 s');

r = scatta(app, 'luce');
verifica(conta(r, 'double_tap') === 1 && SIM.timer.luce === 2000, 'allo scadere ripete il tocco e riparte');
verifica(!r.draw, 'il timer non ridisegna (niente sfarfallio dell\'e-ink)');

r = premi(app, 'bottom_short_press_release');
verifica(r.draw.update_type === 'gc4' && r.draw.lightTestApp.layout_info.inverti === true, 'in basso: sfondo bianco, schermo intero');
r = premi(app, 'bottom_short_press_release');
verifica(r.draw.lightTestApp.layout_info.inverti === false, 'in basso di nuovo: sfondo nero');

r = premi(app, 'middle_hold');
verifica(r.action && r.action.type === 'go_back' && r.action.Se === false, 'centro tenuto con la luce accesa: torna al menu senza chiudere');

cambia_stato(app, 'visible', 'background');
r = scatta(app, 'luce');
verifica(conta(r, 'double_tap') === 1 && !r.draw, 'in background continua a mandare tocchi senza disegnare');

r = premi(app, 'middle_hold');
verifica(!r.action && !r.draw, 'fuori dall\'app non risponde ai tasti');
premi(app, 'top_short_press_release');
verifica(app.luce === true, 'fuori dall\'app il tasto in alto non spegne la luce');

r = cambia_stato(app, 'background', 'visible');
verifica(r.draw.lightTestApp.layout_info.r3 === 'stati vbv', 'al ritorno mostra gli stati');
verifica(r.draw.lightTestApp.layout_info.r6 === 'fuori 2: alto corto', 'e i tasti arrivati da fuori');
print('      schermo dopo il ritorno:');
righe(r, 'lightTestApp');

SIM.ora += 3 * 60 * 60 * 1000;
r = scatta(app, 'luce');
verifica(conta(r, 'double_tap') === 1 && SIM.timer.luce === 2000, 'dopo 3 ore è ancora accesa (niente limite di tempo)');

r = premi(app, 'bottom_hold');
verifica(r.draw.lightTestApp.layout_info.r2 === 'uscita: quadrante', 'in basso tenuto: uscita al quadrante');
r = premi(app, 'middle_hold');
verifica(r.action.type === 'go_home' && r.action.Se === false, 'centro tenuto: torna al quadrante senza chiudere');

cambia_stato(app, 'visible', 'hidden');
r = cambia_stato(app, 'hidden', 'visible');
r = premi(app, 'top_short_press_release');
verifica(app.luce === false && !('luce' in SIM.timer), 'in alto: spegne e ferma il timer');
r = premi(app, 'middle_hold');
verifica(r.action.type === 'go_home' && r.action.Se === true, 'centro tenuto con la luce spenta: chiude l\'app');

verifica(app.nome_tasto('double_tap') === undefined && app.nome_tasto(undefined) === undefined, 'double_tap e eventi senza tipo non sono tasti');

SIM.comune = undefined;
r = cambia_stato(app, 'background', 'visible');
verifica(r.draw.lightTestApp.layout_info.r7 === 'sonno ?  hr ?', 'senza dati di sistema mostra ? invece di bloccarsi');

print('Tutte le prove passate.');
