import { NavLink } from "react-router-dom";

function Home() {
  return (
    <div className="app-page home-page min-h-screen">
      <div className="home-content flex min-h-screen flex-col items-center p-5 text-center">
          <h1 className="font-semibold text-4xl">Passami un file ... con la luce!</h1>
          <p>Una web app per trasferire file piccoli (fino a 70kB) utilizzando codici QR senza internet.</p>

          <h2 className="font-semibold text-2xl mt-10">Come funziona?</h2>
          <ol className="home-instructions list-decimal list-inside space-y-2 text-center">
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

          <h2 className="font-semibold text-2xl mt-10">Usa questa applicazione come</h2>
          <p>Seleziona come desideri che questo dispositivo agisca.</p>

          <div className="flex flex-wrap justify-center gap-1">
            <NavLink to="/sender" className="px-5 py-2 rounded-md bg-blue-500 text-white cursor-pointer border-2 hover:border-blue-800">
              Mittente
            </NavLink>
            <NavLink to="/receiver" className="px-5 py-2 rounded-md bg-red-500 text-white cursor-pointer border-2 hover:border-red-800">
              Ricevente
            </NavLink>
          </div>
          <div className="home-credits fixed bottom-0 left-0 w-full bg-gray-100 py-2 text-center text-gray-700">
            <p className="text-sm text-center">Credits to <a href="https://github.com/darsh4884" className="text-blue-500 hover:underline">Darsh4884</a> for the original application.</p>
          </div>
      </div>
    </div>
  );
}

export default Home;
