import { NavLink } from "react-router-dom";
import { useRef, useState } from "react";
import jsQR from "jsqr";

function Receiver() {
  const MAX_SCAN_WIDTH = 800;
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
    const scale = Math.min(1, MAX_SCAN_WIDTH / videoWidth);
    const scan_width = Math.floor(videoWidth * scale);
    const scan_height = Math.floor(videoHeight * scale);

    if (canvas.width !== scan_width || canvas.height !== scan_height) {
      canvas.width = scan_width;
      canvas.height = scan_height;
    }

    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.drawImage(video, 0, 0, scan_width, scan_height);

    return context.getImageData(0, 0, canvas.width, canvas.height);
  }

  function onFrame() {
    const current_cam = cam_ref.current;
    const canvas = canvas_ref.current;
    const packets = packets_ref.current;

    const frame_data = getFrameData(current_cam, canvas);
    const { data, width, height } = frame_data;
    const packet = jsQR(data, width, height, { inversionAttempts: "dontInvert" });

    if (packet && packet.data) {
      let decoded_packet;

      try {
        decoded_packet = JSON.parse(packet.data);
      } catch {
        current_cam.requestVideoFrameCallback(onFrame);
        return;
      }

      const { data, name, type, id, total } = decoded_packet;

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
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30, max: 30 },
        },
      });

      current_cam.srcObject = stream;

      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities();
      if (capabilities.focusMode?.includes("continuous")) {
        try {
          await track.applyConstraints({ advanced: [{ focusMode: "continuous" }] });
        } catch (err) {
          console.warn("Continuous autofocus is not available: ", err);
        }
      }

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
    <div className="app-page receiver-page min-h-screen">
      <div className="row">
        <div className="col flex flex-col items-center p-5 text-center">
          <h1 className="text-4xl font-semibold">Sei il ricevente!</h1>
          <p>Accendi la tua fotocamera e scansiona i codici QR sul dispositivo dell'altro utente</p>

          <div className="receiver-layout flex w-full max-w-5xl flex-col items-center">
            <div className="flex w-full max-w-[520px] flex-col items-center">
              <video className="receiver-camera w-[300px] h-[300px] border-2 my-2 object-cover" ref={cam_ref} autoPlay playsInline></video>
              <canvas className="hidden" ref={canvas_ref}></canvas>
              <div className="flex flex-wrap justify-center gap-2">
                <NavLink className="px-5 py-2 rounded-md bg-blue-500 text-white cursor-pointer border-2 hover:border-blue-800" to="/">
                  Indietro
                </NavLink>
                <button className="px-5 py-2 rounded-md bg-green-500 text-white cursor-pointer border-2 hover:border-green-800" onClick={openCamera}>
                  Accendi Fotocamera
                </button>
                <button className="px-5 py-2 rounded-md bg-red-500 text-white cursor-pointer border-2 hover:border-red-800" onClick={closeCamera}>
                  Spegni Fotocamera
                </button>
              </div>
            </div>
            <div className="receiver-status mt-2 w-full max-w-[520px]">
              <h2 className="text-lg font-semibold">Progresso - {progress}%</h2>
              <div className="progress receiver-progress">
                <div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style={{ width: `${progress}%` }}></div>
              </div>
              <h2 className="text-lg font-semibold mt-2">Pacchetti ricevuti - {received_packets}/{total_packets}</h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Receiver;
