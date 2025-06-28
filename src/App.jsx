import React, { useState, useEffect } from "react";
import { dataManager } from "./core/DataManager";
import { eventBus } from "./core/EventBus";
import CandleChart from "./CandleChart";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [loadedRows, setLoadedRows] = useState(0);
  const [fileSize, setFileSize] = useState(0);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);
  const [preview, setPreview] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalRows, setTotalRows] = useState(0);

  useEffect(() => {
    const unsubChunk = eventBus.subscribe("data:chunkLoaded", ({ offset, chunk }) => {
      setLoadedRows(offset + chunk.length);
      setLogs((logs) => [`Chunk chargé : ${chunk.length} lignes à l’offset ${offset}`, ...logs].slice(0, 20));
    });
    const unsubAll = eventBus.subscribe("data:allLoaded", ({ totalRows }) => {
      setLoading(false);
      setLogs((logs) => [`✅ Chargement terminé. Total : ${totalRows} lignes.`, ...logs].slice(0, 20));
      setTotalRows(totalRows);
      // Affiche les 5 premières bougies du cache
      const candles = dataManager.getCandles(0, 5);
      setPreview(candles);
      setCurrentIndex(0); // on remet à zéro à chaque chargement
    });

    return () => {
      unsubChunk();
      unsubAll();
    };
  }, []);

  const handleLoad = async () => {
    setLoading(true);
    setLogs((logs) => ["⏳ Démarrage du chargement…", ...logs]);
    setLoadedRows(0);
    setProgress(0);
    setFileSize(0);
    setPreview([]);
    setTotalRows(0);
    setCurrentIndex(0);
    try {
      const headResp = await fetch(dataManager.csvUrl, { method: "HEAD" });
      const size = Number(headResp.headers.get("Content-Length") || 0);
      setFileSize(size);
    } catch {
      setFileSize(0);
    }
    dataManager.loadCSV({
      onChunk: (chunk) => {
        setProgress((prev) => prev + chunk.length);
      }
    });
  };

  // Bougie courante pour affichage
  const currentCandle = dataManager.getCandles(currentIndex, 1)[0];

  // Fenêtre pour le chart
  const chartWindowSize = 200;
  const chartStart = Math.max(0, currentIndex - chartWindowSize / 2);
  const chartCandles = dataManager.getCandles(chartStart, chartWindowSize);

  // Navigation
  const handlePrev = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const handleNext = () => setCurrentIndex((i) => Math.min(totalRows - 1, i + 1));
  const handleSlider = (e) => setCurrentIndex(Number(e.target.value));

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h1>Backtesting Manuel Trading</h1>
      <button onClick={handleLoad} disabled={loading} style={{ padding: "0.5rem 1rem", fontSize: 16 }}>
        {loading ? "Chargement en cours…" : "Charger les données CSV"}
      </button>
      <div style={{ margin: "1rem 0" }}>
        <strong>Progression :</strong>
        <div>
          {loadedRows} lignes chargées
          {fileSize > 0 && (
            <>
              {" "}
              –{" "}
              {((loadedRows * 100) / (fileSize / 60)).toFixed(2)}% est.
            </>
          )}
        </div>
      </div>

      {/* Aperçu des premières bougies */}
      {preview.length > 0 && (
        <div style={{ margin: "1rem 0" }}>
          <strong>Aperçu des 5 premières bougies :</strong>
          <table style={{ width: "100%", background: "#222", color: "#fff", borderRadius: 6, fontSize: 14 }}>
            <thead>
              <tr>
                <th style={{ padding: "0.3em" }}>Date</th>
                <th>Open</th>
                <th>High</th>
                <th>Low</th>
                <th>Close</th>
                <th>Volume</th>
              </tr>
            </thead>
            <tbody>
              {preview.map((candle, i) => (
                <tr key={i}>
                  <td style={{ padding: "0.3em" }}>{candle.datetime?.toString?.().slice(0, 19) || candle.datetime}</td>
                  <td>{candle.open}</td>
                  <td>{candle.high}</td>
                  <td>{candle.low}</td>
                  <td>{candle.close}</td>
                  <td>{candle.volume}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Chart */}
      {totalRows > 0 && chartCandles.length > 0 && (
        <CandleChart candles={chartCandles} currentIndex={currentIndex - chartStart} />
      )}

      {/* Navigation et affichage bougie courante */}
      {totalRows > 0 && (
        <div style={{ margin: "1.2rem 0", background: "#222", color: "#fff", borderRadius: 6, padding: "1em" }}>
          <strong>Bougie courante (index {currentIndex + 1} / {totalRows}) :</strong>
          {currentCandle ? (
            <table style={{ width: "100%", fontSize: 15, marginTop: 8 }}>
              <tbody>
                <tr>
                  <td>Date</td>
                  <td>{currentCandle.datetime?.toString?.().slice(0, 19) || currentCandle.datetime}</td>
                </tr>
                <tr>
                  <td>Open</td>
                  <td>{currentCandle.open}</td>
                </tr>
                <tr>
                  <td>High</td>
                  <td>{currentCandle.high}</td>
                </tr>
                <tr>
                  <td>Low</td>
                  <td>{currentCandle.low}</td>
                </tr>
                <tr>
                  <td>Close</td>
                  <td>{currentCandle.close}</td>
                </tr>
                <tr>
                  <td>Volume</td>
                  <td>{currentCandle.volume}</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <div>Chargement…</div>
          )}
          <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={handlePrev} disabled={currentIndex === 0}>⬅️ Précédent</button>
            <input
              type="range"
              min={0}
              max={totalRows - 1}
              value={currentIndex}
              onChange={handleSlider}
              style={{ flex: 1 }}
            />
            <button onClick={handleNext} disabled={currentIndex >= totalRows - 1}>Suivant ➡️</button>
          </div>
        </div>
      )}

      <div style={{ background: "#181c24", color: "#e6e6e6", padding: "1rem", borderRadius: 8, minHeight: 120 }}>
        <strong>Logs d’événements :</strong>
        <ul style={{ fontSize: "0.93em", margin: 0, paddingLeft: 18 }}>
          {logs.map((log, i) => (
            <li key={i}>{log}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}