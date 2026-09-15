import { NavLink } from "react-router-dom";

function Home() {
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col p-5">
          <h1 className="font-semibold text-4xl">QR-Transfer</h1>
          <p>Un'app per trasferire file piccoli (fino a 100kb) utilizzando codici QR senza internet. (Crediti a <a href="https://github.com/darsh4884" className="text-blue-500 hover:underline">Darsh4884</a>) per l'applicazione originale.</p>

          <h1 className="font-semibold text-2xl mt-2">How it works</h1>
          <ol className="list-decimal list-inside space-y-2">
            <li>
              Sul dispositivo che invia il file, seleziona <strong>Mittente</strong>.
            </li>
            <li>Scegli il file che desideri trasferire.</li>
            <li>
              Clicca su <strong>Trasferisci</strong> per iniziare a mostrare i codici QR sullo schermo del dispositivo mittente.
            </li>
            <li>
              Sul dispositivo che riceve il file, seleziona <strong>Ricevente</strong>.
            </li>
            <li>Attiva la fotocamera e tienila puntata sullo schermo del mittente mentre i codici QR sono visualizzati.</li>
            <li>Aspetta finché tutti i codici QR non saranno stati scansionati. Il file verrà ricostruito e scaricato automaticamente.</li>
          </ol>

          <h1 className="font-semibold text-2xl mt-2">Usa questa applicazione come</h1>
          <p>Seleziona come desideri che questo dispositivo agisca.</p>

          <div className="flex flex-wrap gap-1">
            <NavLink to="/sender" className="px-5 py-2 rounded-md bg-blue-500 text-white cursor-pointer border-2 hover:border-blue-800">
              Mittente
            </NavLink>
            <NavLink to="/receiver" className="px-5 py-2 rounded-md bg-red-500 text-white cursor-pointer border-2 hover:border-red-800">
              Ricevente
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
