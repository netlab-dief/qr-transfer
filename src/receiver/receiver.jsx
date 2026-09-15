import { NavLink } from "react-router-dom";
import { useRef, useState } from "react";
import jsQR from "jsqr";

function Receiver() {
  const cam_ref = useRef(null);
  const canvas_ref = useRef(null);
  const packets_ref = useRef({});
  const file_type_ref = useRef("");
  const file_name_ref = useRef("");

  const [current_pkt_data, setCurrentPacketData] = useState("");
  const [total_packets, setTotalPackets] = useState(0);
  const [received_packets, setReceivedPackets] = useState(0);
  const [progress, setProgress] = useState(0);

  function getFrameData(video, canvas) {
    const { videoWidth, videoHeight } = video;
    canvas.width = videoWidth;
    canvas.height = videoHeight;

    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.drawImage(video, 0, 0);

    return context.getImageData(0, 0, canvas.width, canvas.height);
  }

  function onFrame() {
    const current_cam = cam_ref.current;
    const canvas = canvas_ref.current;
    const packets = packets_ref.current;

    const frame_data = getFrameData(current_cam, canvas);
    const { data, width, height } = frame_data;
    const packet = jsQR(data, width, height);

    if (packet && packet.data) {
      const decoded_packet = JSON.parse(packet.data);
      const { data, name, size, type, id, total } = decoded_packet;

      file_type_ref.current = type;
      file_name_ref.current = name;

      if (!packets[id]) {
        packets[id] = data;

        const received_pkts = Object.keys(packets).length;

        setCurrentPacketData(data);
        setReceivedPackets(received_pkts);
        setTotalPackets(total);

        setProgress(((received_pkts / total) * 100).toFixed(2));

        if (total !== 0 && total === received_pkts) {
          closeCamera();
          reconstructFile();
          return;
        }
      }
    }

    current_cam.requestVideoFrameCallback(onFrame);
  }

  function reconstructFile() {
    const packets = packets_ref.current;
    const file_name = file_name_ref.current;
    const file_type = file_type_ref.current;

    const base64 = Object.keys(packets)
      .map(Number)
      .sort((a, b) => a - b)
      .map((index) => packets[index])
      .join("");

    const binary = atob(base64);

    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    const file = new File([bytes], file_name, {
      type: file_type,
    });

    downloadFile(file);
  }

  function downloadFile(file) {
    const url = URL.createObjectURL(file);

    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.click();

    URL.revokeObjectURL(url);
  }

  async function openCamera() {
    const current_cam = cam_ref.current;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
        },
      });

      current_cam.srcObject = stream;

      current_cam.requestVideoFrameCallback(onFrame);
    } catch (err) {
      console.error("Error opening camera: ", err);
    }
  }

  function closeCamera() {
    if (cam_ref.current && cam_ref.current.srcObject) {
      const tracks = cam_ref.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    }
    cam_ref.current.srcObject = null;
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col p-5">
          <h1 className="text-4xl font-semibold">Sei il ricevente!</h1>
          <p>Accendi la tua fotocamera e scansiona i codici QR sul dispositivo dell'altro utente</p>

          <div className="row">
            <div className="col-lg-6">
              <video className="w-[300px] h-[300px] border-2 my-2 object-cover" ref={cam_ref} autoPlay playsInline></video>
              <canvas className="hidden" ref={canvas_ref}></canvas>
              <div className="w-full flex flex-wrap text-white gap-2">
                <NavLink className="px-5 py-2 rounded-md bg-blue-500 text-white cursor-pointer border-2 hover:border-blue-800" to="/">
                  Back
                </NavLink>
                <button className="px-5 py-2 rounded-md bg-green-500 text-white cursor-pointer border-2 hover:border-green-800" onClick={openCamera}>
                  Open Camera
                </button>
                <button className="px-5 py-2 rounded-md bg-red-500 text-white cursor-pointer border-2 hover:border-red-800" onClick={closeCamera}>
                  Close Camera
                </button>
              </div>
            </div>
            <div className="col-lg-6 lg:mt-0 mt-2">
              <h2 className="text-lg font-semibold">Received Packet</h2>
              <p>
                I dettagli dei pacchetti ricevuti verranno visualizzati qui. Puoi vedere i dati del pacchetto corrente, il numero di pacchetti ricevuti e il numero totale di pacchetti.
                <br />
                Una volta che tutti i pacchetti sono stati ricevuti, il file verrà ricostruito e scaricato automaticamente.
              </p>
              <pre className="bg-gray-100 p-2 rounded-md text-sm mt-2 border">
                {JSON.stringify(
                  {
                    data: current_pkt_data.slice(0, 10).concat("..."),
                    received: received_packets,
                    total: total_packets,
                    file_type: file_type_ref.current,
                    file_name: file_name_ref.current,
                  },
                  null,
                  2,
                )}
              </pre>
              <h2 className="text-lg font-semibold mt-2">Progresso - {progress}%</h2>
              <div className="progress">
                <div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Receiver;
