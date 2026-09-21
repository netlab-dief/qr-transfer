import { useState, useRef } from "react";
import { NavLink } from "react-router-dom";

import QRCode from "qrcode";

function Sender() {
  const is_transferring_ref = useRef(false);
  const qr_code_img_ref = useRef(null);

  const [file_to_transfer, setFileToTransfer] = useState(null);
  const [file_path, setFilePath] = useState("");
  const [current_packet, setCurrentPacket] = useState(null);

  const PACKET_SIZE = 500;
  const DELAY_BETWEEN_QR_CODES = 200;
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  function handleFileSelection(e) {
    e.preventDefault();

    const file = e.target.files[0];
    const path = e.target.value;

    if (!file) {
      alert("File Not Selected");
      return;
    }

    if (file.size > 70000) {
      alert("Il file è troppo grande! Seleziona un file più piccolo di 70kB.");
      setFileToTransfer(null);
      setFilePath("");
      return;
    }

    setFileToTransfer(file);
    setFilePath(path);
  }

  async function startTransfer() {
    if (!file_to_transfer) {
      alert("No file selected");
      return;
    }
    if (is_transferring_ref.current) {
      alert("A transfer is already in progress");
      return;
    }

    const { name, type, size } = file_to_transfer;

    const buffer = await file_to_transfer.arrayBuffer();
    const binary_data = new Uint8Array(buffer);
    const encoded_file_data = btoa(String.fromCharCode(...binary_data));

    const packets = [];
    let count = 0;

    for (let i = 0; i < encoded_file_data.length; i += PACKET_SIZE) {
      const chunk = encoded_file_data.slice(i, i + PACKET_SIZE);
      const packet = { id: count, name, size, type, data: chunk };
      packets.push(packet);
      count++;
    }

    packets.forEach((packet) => {
      packet["total"] = count;
    });

    const qr_codes = await Promise.all(
      packets.map((packet) =>
        QRCode.toDataURL(JSON.stringify(packet), {
          errorCorrectionLevel: "Q",
        }),
      ),
    );

    is_transferring_ref.current = true;
    renderQrCodes(packets, qr_codes);
  }

  async function renderQrCodes(packets, qr_codes) {
    for (let index = 0; index < packets.length; index++) {
      if (!is_transferring_ref.current) {
        return;
      }

      const packet = packets[index];
      setCurrentPacket(packet);

      qr_code_img_ref.current.src = qr_codes[index];

      await delay(DELAY_BETWEEN_QR_CODES);
    }

    renderQrCodes(packets, qr_codes);
  }

  function stopTransfer() {
    is_transferring_ref.current = false;
  }

  return (
    <div className="sender-page min-h-screen bg-blue-50 text-blue-950">
      <div className="row">
        <div className="col flex flex-col items-center p-5 text-center">
          <h1 className="text-4xl font-semibold text-blue-950">Sei il mittente!</h1>
          <p>Seleziona un file (più piccolo di 70kB) e clicca su trasferisci</p>
          <p>L'app inizierà a mostrare codici QR continui che puoi scansionare sul dispositivo dell'altro utente che fungerà da ricevente</p>

          <div className="mt-2 w-full max-w-xl">
            <input value={file_path} className="form-control border-blue-300 bg-white text-blue-900" type="file" onChange={handleFileSelection} />
          </div>

          <div className="mt-2 flex flex-wrap justify-center gap-1">
            <NavLink to="/" className="px-5 py-2 rounded-md bg-blue-500 text-white cursor-pointer border-2 hover:border-blue-800">
              Back
            </NavLink>
            <button className="px-5 py-2 rounded-md bg-green-500 text-white cursor-pointer border-2 hover:border-green-800" onClick={startTransfer}>
              Start
            </button>
            <button className="px-5 py-2 rounded-md bg-red-500 text-white cursor-pointer border-2 hover:border-red-800" onClick={stopTransfer}>
              Stop
            </button>
          </div>

          <div className="mt-2 mx-auto flex aspect-square w-full max-w-[520px] items-center justify-center border border-blue-300 bg-white p-2 shadow-sm">
            <img ref={qr_code_img_ref} className="w-full h-full object-contain" alt="qr-code" src={`no-qr-placeholder.png`} />
          </div>
          <pre className="mt-2 w-full max-w-xl overflow-auto rounded border border-blue-200 bg-blue-100 p-4 text-center text-sm text-blue-950">
            <p className="font-semibold">Current Data Packet</p>
            {JSON.stringify(current_packet, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default Sender;
