import { useEffect, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function QRScanner() {
  const [result, setResult] = useState(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    let qr = null;
    
    const startScanner = async () => {
      try {
        qr = new Html5Qrcode("reader");
        setScanning(true);
        
        // Essayer de trouver la caméra arrière
        let cameraId = null;
        try {
          const devices = await Html5Qrcode.getCameras();
          if (devices && devices.length > 0) {
            // Chercher la caméra arrière (environment)
            const backCamera = devices.find(device => 
              device.label.toLowerCase().includes('back') || 
              device.label.toLowerCase().includes('rear') ||
              device.label.toLowerCase().includes('arrière')
            );
            cameraId = backCamera ? backCamera.id : devices[0].id;
            console.log("📷 Caméra trouvée:", cameraId);
          }
        } catch (err) {
          console.log("⚠️ Impossible de lister les caméras, utilisation de facingMode");
        }
        
        // Utiliser l'ID de caméra si trouvé, sinon utiliser "environment" (string)
        const cameraConfig = cameraId || "environment";
        
        await qr.start(
          cameraConfig,
          { 
            fps: 10, 
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            disableFlip: false
          },
          (decodedText, decodedResult) => {
            console.log("✅✅✅ CODE SCANNÉ DÉTECTÉ:", decodedText);
            console.log("Résultat complet:", decodedResult);
            
            // Arrêter le scanner immédiatement
            qr.stop().then(() => {
              setScanning(false);
              setResult(decodedText);
              setError(null);
              
              // Récupérer les données
              fetch("/data.json")
                .then(res => res.json())
                .then(json => {
                  console.log(`📊 ${json.length} éléments chargés`);
                  
                  const found = json.find(item => item.id?.trim() === decodedText.trim());
                  
                  if (found) {
                    console.log("✅ Trouvé:", found);
                    setData(found);
                    setError(null);
                  } else {
                    console.log("❌ Code non trouvé");
                    console.log("Code recherché:", decodedText);
                    console.log("Premiers codes:", json.slice(0, 5).map(i => i.id));
                    setData(null);
                    setError(`Code non trouvé: ${decodedText}`);
                  }
                })
                .catch(err => {
                  setError(`Erreur: ${err.message}`);
                  console.error("❌ Erreur:", err);
                });
            }).catch(err => {
              console.error("Erreur arrêt scanner:", err);
            });
          },
          (errorMessage) => {
            // Ne pas logger toutes les erreurs pour éviter le spam
            // Le scanner continue à essayer
          }
        );
        
        console.log("📸 Scanner démarré");
      } catch (err) {
        setError(`Impossible de démarrer la caméra: ${err.message}`);
        console.error("❌ Erreur caméra:", err);
        setScanning(false);
      }
    };

    // Petit délai pour s'assurer que le DOM est prêt
    const timer = setTimeout(() => {
      startScanner();
    }, 100);

    return () => {
      clearTimeout(timer);
      if (qr) {
        qr.stop().then(() => {
          qr.clear();
        }).catch(() => {});
      }
    };
  }, []);

  const resetScanner = () => {
    window.location.reload();
  };

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      <h2 style={{ textAlign: "center", color: "#2c3e50" }}>
        📸 Scanner QR Code
      </h2>

      <div style={{
        maxWidth: "500px",
        margin: "20px auto",
        border: "2px solid #3498db",
        borderRadius: "10px",
        overflow: "hidden"
      }}>
        <div id="reader" style={{ width: "100%" }} />
      </div>

      {scanning && !result && (
        <div style={{
          textAlign: "center",
          color: "#3498db",
          fontSize: "16px",
          marginTop: "20px"
        }}>
          ⏳ Caméra active - Scannez un QR code...
        </div>
      )}

      {result && (
        <div style={{
          marginTop: "20px",
          padding: "15px",
          backgroundColor: "#e8f5e9",
          borderRadius: "8px",
          border: "2px solid #4caf50"
        }}>
          <p style={{ margin: 0 }}>
            <strong>✅ Code scanné:</strong> <code>{result}</code>
          </p>
        </div>
      )}

      {error && (
        <div style={{
          marginTop: "20px",
          padding: "15px",
          backgroundColor: "#ffebee",
          borderRadius: "8px",
          border: "2px solid #f44336",
          color: "#c62828"
        }}>
          <p style={{ margin: 0 }}>❌ {error}</p>
        </div>
      )}

      {data && (
        <div style={{
          marginTop: "30px",
          border: "2px solid #3498db",
          borderRadius: "10px",
          overflow: "hidden",
          backgroundColor: "#fff"
        }}>
          <div style={{
            backgroundColor: "#3498db",
            color: "white",
            padding: "15px",
            fontSize: "18px",
            fontWeight: "bold"
          }}>
            📋 Informations du matériel
          </div>
          
          <div style={{ padding: "20px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {Object.entries(data).map(([key, value]) => {
                  if (!value || value === '' || key === 'col_27') return null;
                  
                  return (
                    <tr key={key} style={{ borderBottom: "1px solid #ecf0f1" }}>
                      <td style={{
                        padding: "12px",
                        fontWeight: "bold",
                        width: "35%",
                        color: "#34495e",
                        verticalAlign: "top",
                        fontSize: "14px"
                      }}>
                        {key}
                      </td>
                      <td style={{
                        padding: "12px",
                        color: "#2c3e50",
                        fontSize: "14px",
                        wordBreak: "break-word"
                      }}>
                        {value}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {result && (
        <div style={{ textAlign: "center", marginTop: "30px" }}>
          <button
            onClick={resetScanner}
            style={{
              backgroundColor: "#3498db",
              color: "white",
              border: "none",
              padding: "15px 30px",
              fontSize: "16px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            🔄 Scanner un autre QR Code
          </button>
        </div>
      )}
    </div>
  );
}
