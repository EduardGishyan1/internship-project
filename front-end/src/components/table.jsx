import React, { useEffect, useState } from "react";
import axios from "axios";
import "./table.css";

const symbolToName = {
  AAPL: "Apple Inc.",
  MSFT: "Microsoft Corporation",
  GOOGL: "Alphabet Inc. (Google)",
  AMZN: "Amazon.com, Inc.",
  META: "Meta Platforms, Inc.",
  TSLA: "Tesla, Inc.",
  "BRK.B": "Berkshire Hathaway Inc. (Class B)",
  JNJ: "Johnson & Johnson",
  V: "Visa Inc.",
  WMT: "Walmart Inc.",
  NVDA: "NVIDIA Corporation",
  JPM: "JPMorgan Chase & Co.",
  UNH: "UnitedHealth Group Incorporated",
  HD: "The Home Depot, Inc.",
  PG: "Procter & Gamble Company",
  MA: "Mastercard Incorporated",
  DIS: "The Walt Disney Company",
  BAC: "Bank of America Corporation",
  ADBE: "Adobe Inc.",
  CMCSA: "Comcast Corporation",
  NFLX: "Netflix Inc.",
  XOM: "Exxon Mobil Corporation",
  INTC: "Intel Corporation",
  KO: "The Coca-Cola Company",
  CSCO: "Cisco Systems, Inc.",
  PFE: "Pfizer Inc.",
  PEP: "PepsiCo, Inc.",
  VZ: "Verizon Communications Inc.",
  T: "AT&T Inc.",
  ABBV: "AbbVie Inc.",
  CVX: "Chevron Corporation",
  ABT: "Abbott Laboratories",
  CRM: "Salesforce, Inc.",
  NKE: "NIKE, Inc.",
  ORCL: "Oracle Corporation",
  MRK: "Merck & Co., Inc.",
  TMO: "Thermo Fisher Scientific Inc.",
  ACN: "Accenture Plc",
  WFC: "Wells Fargo & Company",
  MCD: "McDonald's Corporation",
  DHR: "Danaher Corporation",
  LLY: "Eli Lilly and Company",
  MDT: "Medtronic plc",
  COST: "Costco Wholesale Corporation",
  NEE: "NextEra Energy, Inc.",
  AMGN: "Amgen Inc.",
  TXN: "Texas Instruments Incorporated",
  HON: "Honeywell International Inc.",
  QCOM: "Qualcomm Incorporated",
  BMY: "Bristol-Myers Squibb Company",
  LIN: "Linde plc",
  PM: "Philip Morris International Inc.",
  UPS: "United Parcel Service, Inc.",
  RTX: "Raytheon Technologies Corporation",
  LOW: "Lowe's Companies, Inc.",
  UNP: "Union Pacific Corporation",
  GS: "The Goldman Sachs Group, Inc.",
  CAT: "Caterpillar Inc.",
  BLK: "BlackRock, Inc.",
  IBM: "International Business Machines Corporation"
};

const BACK_END_URI = import.meta.env.VITE_BACK_END_URI;

const Table = () => {
  const [data, setData] = useState([]);
  const [hoverBox, setHoverBox] = useState({ visible: false, x: 0, y: 0, stock: null });
  const [selectedStock, setSelectedStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiPrediction, setAiPrediction] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  useEffect(() => {
    axios.get(`${BACK_END_URI}/finnhub/quotes`,{
      headers: {
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      }
    })
        .then((response) => {
          const validatedData = response.data.map(item => ({
            symbol: item.symbol || "N/A",
            currentPrice: item.currentPrice,
            highPrice: item.highPrice,
            lowPrice: item.lowPrice,
            openPrice: item.openPrice,
            timestamp: item.timestamp,
            priceDifference: item.priceDifference
          }));
          setData(validatedData);
          setLoading(false);
        });
  }, []);

  const handleMouseEnter = (e, stock) => {
    setHoverBox({ visible: true, x: e.clientX + 10, y: e.clientY + 10, stock });
  };

  const handleMouseMove = (e) => {
    setHoverBox((prev) => ({ ...prev, x: e.clientX + 10, y: e.clientY + 10 }));
  };

  const handleMouseLeave = () => {
    setHoverBox({ visible: false, x: 0, y: 0, stock: null });
  };

  const handleRowClick = (stock) => {
    const companyName = symbolToName[stock.symbol] || stock.symbol;
    setSelectedStock({ ...stock, companyName });
    setAiPrediction("");
    setAiError("");
  };

  const closeModal = () => {
    setSelectedStock(null);
    setAiPrediction("");
    setAiError("");
  };

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape" && selectedStock) {
        closeModal();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [selectedStock]);

  const fetchAIPrediction = async () => {
    if (!selectedStock) return;
    setAiLoading(true);
    setAiError("");
    setAiPrediction("");

    try {
      const response = await axios.get(`${BACK_END_URI}/news/predict/${selectedStock.symbol}`,{
        headers: {
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      });
      console.log(response.data);
      setAiPrediction(response.data);
    } catch (error) {
      setAiError("Failed to fetch AI prediction.");
      console.error(error);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
        <div className="loader-wrapper">
          <div className="loader"></div>
        </div>
    );
  }

  return (
      <>
        <div className="header">
          <h1>Stock Market</h1>
        </div>

        <div className="table-container">
          <div className="mainDiv">
            <table>
              <thead>
              <tr>
                <th>Company</th>
                <th>Current</th>
                <th>High</th>
                <th>Low</th>
                <th>Open</th>
                <th>Timestamp</th>
                <th>Price Difference</th>
              </tr>
              </thead>
              <tbody>
              {data.map((stock, i) => (
                  <tr
                      key={i}
                      onMouseEnter={(e) => handleMouseEnter(e, stock)}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                      onClick={() => handleRowClick(stock)}
                      style={{ cursor: "pointer" }}
                  >
                    <td>{stock.symbol}</td>
                    <td>${stock.currentPrice?.toFixed(2)}</td>
                    <td>${stock.highPrice?.toFixed(2)}</td>
                    <td>${stock.lowPrice?.toFixed(2)}</td>
                    <td>${stock.openPrice?.toFixed(2)}</td>
                    <td>{stock.timestamp ? new Date(parseInt(stock.timestamp) * 1000).toLocaleString() : "-"}</td>
                    <td>${stock.priceDifference}</td>
                  </tr>
              ))}
              </tbody>
            </table>
          </div>

          {hoverBox.visible && (
              <div
                  className="hover-box"
                  style={{
                    position: "fixed",
                    left: hoverBox.x,
                    top: hoverBox.y,
                    width: "300px",
                    height: "60px",
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    color: "#fff",
                    padding: "10px",
                    borderRadius: "8px",
                    zIndex: 1000,
                    pointerEvents: "none"
                  }}
              >
                <p><strong>{hoverBox.stock.symbol}</strong></p>
                <p>Current: {hoverBox.stock.currentPrice}</p>
              </div>
          )}

          {selectedStock && (
              <div className="modal-backdrop" onClick={closeModal}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <h2>{selectedStock.companyName}</h2>
                  <p>{selectedStock.timestamp ? new Date(parseInt(selectedStock.timestamp) * 1000).toLocaleString() : "-"}</p>
                  <p>Current Price: ${selectedStock.currentPrice}</p>
                  <p>High: ${selectedStock.highPrice}</p>
                  <p>Low: ${selectedStock.lowPrice}</p>
                  <p>Open: ${selectedStock.openPrice}</p>
                  <p>Price Difference: ${selectedStock.priceDifference}</p>

                  <div>
                    {aiLoading ? (
                        <div className="loader"></div>
                    ) : aiPrediction ? (
                        <h2 className="aiPredictionResult">{aiPrediction}</h2>
                    ) : (
                        <button className="aiPrediction" onClick={fetchAIPrediction}>
                          AI Prediction
                        </button>
                    )}
                  </div>

                  {aiError && <p style={{ color: "red" }}>{aiError}</p>}
                  <button className="closeBtn" onClick={closeModal}>Close</button>
                </div>
              </div>
          )}
        </div>
      </>
  );
};

export default Table;
