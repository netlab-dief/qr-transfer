import { useState, useRef } from "react";
import { NavLink } from "react-router-dom";

import QRCode from "qrcode";

function Sender() {
  const is_transferring_ref = useRef(false);
  const qr_code_img_ref = useRef(null);

  const [file_to_transfer, setFileToTransfer] = useState(null);
  const [file_path, setFilePath] = useState("");
  const [current_packet, setCurrentPacket] = useState(null);

  const PACKET_SIZE = 400;
  const DELAY_BETWEEN_QR_CODES = 150;

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  function handleFileSelection(e) {
    e.preventDefault();

    const file = e.target.files[0];
    const path = e.target.value;

    if (!file) {
      alert("File Not Selected");
      return;
    }

    if (file.size > 100000) {
      alert("File size is too big. Please select a file smaller than 100kb");
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

    is_transferring_ref.current = true;
    renderQrCodes(packets);
  }

  async function renderQrCodes(packets) {
    for (const packet of packets) {
      if (!is_transferring_ref.current) {
        return;
      }

      setCurrentPacket(packet);

      const json_payload = JSON.stringify(packet);
      const qr_code = await QRCode.toDataURL(json_payload);
      qr_code_img_ref.current.src = qr_code;

      await delay(DELAY_BETWEEN_QR_CODES);
    }

    renderQrCodes(packets);
  }

  function stopTransfer() {
    is_transferring_ref.current = false;
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col p-5">
          <h1 className="text-4xl font-semibold">Sei il mittente!</h1>
          <p>Seleziona un file (più piccolo di 100kb) e clicca su trasferisci</p>
          <p>L'app inizierà a mostrare codici QR continui che puoi scansionare sul dispositivo dell'altro utente che fungerà da ricevente</p>

          <div className="lg:max-w-[50%] mt-2">
            <input value={file_path} className="form-control" type="file" onChange={handleFileSelection} />
          </div>

          <div className="flex flex-wrap gap-1 mt-2">
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

          <div className="mt-2 lg:w-[300px] lg:h-[300px] border border-gray-300 p-2">
            <img ref={qr_code_img_ref} className="object-contain" alt="qr-code" src={`no-qr-placeholder.png`} />
          </div>
          <pre className="lg:w-[50%] bg-gray-100 p-4 rounded overflow-auto text-sm mt-2">
            <p className="font-semibold">Current Data Packet</p>
            {JSON.stringify(current_packet, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default Sender;
