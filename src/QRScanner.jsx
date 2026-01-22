import { useEffect, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function QRScanner() {
  const [result, setResult] = useState(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const qr = new Html5Qrcode("reader");

    qr.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250 },
      async (decodedText) => {
        setResult(decodedText);
        setError(null);

        try {
          const res = await fetch("/data.json");
          const json = await res.json();

          const found = json.find(item => item.id === decodedText);
          
          if (found) {
            setData(found);
          } else {
            setData(null);
            setError("Aucune donnée trouvée pour ce code");
          }

          qr.stop();
        } catch (err) {
          setError("Erreur lors du chargement des données");
          console.error(err);
        }
      }
    );

    return () => {
      qr.stop().catch(() => {});
    };
  }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h2>Scanner QR Code</h2>
      <div id="reader" style={{ width: "100%", maxWidth: "500px" }} />

      {result && (
        <div style={{ marginTop: "20px" }}>
          <p><strong>Code scanné :</strong> {result}</p>
        </div>
      )}

      {error && (
        <div style={{ marginTop: "20px", color: "red" }}>
          <p>{error}</p>
        </div>
      )}

      {data && (
        <div style={{ 
          marginTop: "20px", 
          border: "1px solid #ccc", 
          padding: "15px", 
          borderRadius: "8px",
          backgroundColor: "#f9f9f9"
        }}>
          <h3>Informations du matériel</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {Object.entries(data).map(([key, value]) => (
                key !== 'id' && value && (
                  <tr key={key} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ 
                      padding: "8px", 
                      fontWeight: "bold", 
                      width: "40%",
                      verticalAlign: "top"
                    }}>
                      {key}
                    </td>
                    <td style={{ padding: "8px" }}>
                      {value}
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
