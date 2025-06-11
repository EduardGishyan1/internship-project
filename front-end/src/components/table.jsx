import React, { useEffect, useState } from "react";
import axios from "axios";
import "./table.css";

const BACK_END_URI = import.meta.env.VITE_BACK_END_URI;

const Table = () => {
  const [data, setData] = useState([]);
  const [hoverBox, setHoverBox] = useState({ visible: false, x: 0, y: 0, stock: null });
  const [selectedStock, setSelectedStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiPrediction, setAiPrediction] = useState("");
  const [aiError, setAiError] = useState("");
  const [predictions, setPredictions] = useState({});
  const [aiLoading, setAiLoading] = useState(false);

  const [symbolToName, setSymbolToName] = useState(null);

  useEffect(() => {
    axios.get(`${BACK_END_URI}/companies/map`,{
      headers:{
        "Content-Type":
            "application/json",
        "Accept":
            "application/json",
        "ngrok-skip-browser-warning":
            "true",
        "credentials": true
      }
    })
        .then(response => {
          setSymbolToName(response.data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Failed to fetch company map:', error);
          setLoading(false);
        });
  }, []);


  const fetchPredictionsOnLoad = async (stocks) => {
    if (!stocks || stocks.length === 0) return;

    setAiError("");

    const stocksToFetch = stocks.slice(0, 10);

    try {
      const predictionsResponse = await Promise.all(
          stocksToFetch.map(stock =>
              axios
                  .get(`${BACK_END_URI}/news/predict/${stock.symbol}`,
                      {
                        headers:{
                          "Content-Type":
                              "application/json",
                          "Accept":
                              "application/json",
                          "ngrok-skip-browser-warning":
                              "true",
                          "credentials": true
                        }
                      }
                      )
                  .then(response => ({
                    symbol: stock.symbol,
                    prediction: response.data.prediction,
                    growth: response.data.growth,
                  }))
                  .catch(() => {
                    return {
                      symbol: stock.symbol,
                      prediction: "Error",
                      growth: undefined,
                    }
                  })
          )
      )

      const newPredictions = predictionsResponse.reduce((acc, { symbol, prediction, growth }) => {
        acc[symbol] = { prediction, growth };
        return acc;
      }, {});

      setPredictions(newPredictions);
    } catch (error) {
      console.error("Error in prediction batch:", error);
      setAiError("Failed to fetch some AI predictions.");
    } finally {
      setAiLoading(false);
    }
  };
  const fetchAIPrediction = async () => {
    if (!selectedStock) return;
    // setLoading(true);
    setAiError("");
    setAiPrediction("");

    try {
      const response = await axios.get(`${BACK_END_URI}/news/predict/${selectedStock.symbol}` , {
        headers:
            {
              "Content-Type":
                  "application/json",
              "Accept":
                  "application/json",
              "ngrok-skip-browser-warning":
                  "true",
              "credentials": true
            }

      });
      setAiPrediction(response.data.prediction);
      setPredictions(prev => ({
        ...prev,
        [selectedStock.symbol]: {
          prediction: response.data.prediction,
          growth: response.data.growth,
        },
      }));
    } catch {
      setAiError("Failed to fetch AI prediction.");
    }
  };

  useEffect(() => {
    axios
        .get(`${BACK_END_URI}/finnhub/quotes`,
        {
          headers:
              {
                "Content-Type":
                    "application/json",
                "Accept":
                    "application/json",
                "ngrok-skip-browser-warning":
                    "true",
                "credentials": true
              }

        })
        .then(response => {
          setData(response.data);
          // fetchPredictionsOnLoad(response.data);
          setLoading(false);
        })
        .catch(error => {
          console.log("Error fetching stock data:", error);
          setLoading(false);
        });
  }, []);

  const handleMouseEnter = (e, stock) => {
    setHoverBox({ visible: true, x: e.clientX + 10, y: e.clientY + 10, stock });
  };

  const handleMouseMove = e => {
    setHoverBox(prev => ({ ...prev, x: e.clientX + 10, y: e.clientY + 10 }));
  };

  const handleMouseLeave = () => {
    setHoverBox({ visible: false, x: 0, y: 0, stock: null });
  };

  const handleRowClick = stock => {
    const selection = window.getSelection();
    const selectedText = selection ? selection.toString().trim() : "";

    if (selectedText.length > 0) {
      return;
    }

    setSelectedStock(stock);
    setAiPrediction("");
    setAiError("");
  };

  const closeModal = () => {
    setSelectedStock(null);
    setAiPrediction("");
    setAiError("");
  };

  useEffect(() => {
    const handleEsc = event => {
      if (event.key === "Escape" && selectedStock) {
        closeModal();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [selectedStock]);

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
                <th>Prediction</th>
              </tr>
              </thead>
              <tbody>
              {data.map(stock => (
                  <tr
                      key={stock.symbol}
                      onMouseEnter={e => handleMouseEnter(e, stock)}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                      onClick={() => handleRowClick(stock)}
                      style={{ cursor: "pointer" }}
                  >
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {stock.logo && (
                            <img
                                src={stock.logo}
                                alt={`${stock.symbol} logo`}
                                style={{ width: "20px", height: "20px", borderRadius: "50%" }}
                            />
                        )}
                        <span>{stock.companyName || stock.symbol}</span>
                      </div>
                    </td>
                    <td>${stock.currentPrice?.toFixed(2)}</td>
                    <td>${stock.highPrice?.toFixed(2)}</td>
                    <td>${stock.lowPrice?.toFixed(2)}</td>
                    <td>${stock.openPrice?.toFixed(2)}</td>
                    <td>{stock.timestamp ? new Date(parseInt(stock.timestamp) * 1000).toLocaleString() : "-"}</td>
                    <td>${stock.priceDifference}</td>
                    <td>
                      {predictions[stock.symbol] ? (
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <div
                                className="circle"
                                style={{
                                  backgroundColor:
                                      predictions[stock.symbol]?.growth === true
                                          ? "green"
                                          : predictions[stock.symbol]?.growth === false
                                              ? "red"
                                              : "gray",
                                  width: "13px",
                                  height: "13px",
                                  borderRadius: "50%",
                                  marginLeft: "5px",
                                }}
                            ></div>

                            <span style={{ fontSize: "0.85em" }}>
                            {
                              predictions[stock.symbol].growth === true
                                  ? "Up"
                                  : predictions[stock.symbol].growth === false
                                      ? "Down"
                                      : "N/A"
                            }
                        </span>
                          </div>
                      ) : aiLoading ? (
                          <span>Loading...</span>
                      ) : (
                          <span>N/A</span>
                      )}
                    </td>
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
                    pointerEvents: "none",
                  }}
              >
                <p>
                  <strong>{symbolToName[hoverBox.stock.symbol]}</strong>
                </p>
                <p>Current: {hoverBox.stock.currentPrice}</p>
              </div>
          )}

          {selectedStock && (
              <div className="modal-backdrop" onClick={closeModal}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                  <div className="modal-header">
                  <h2>{symbolToName[selectedStock.symbol]}</h2>
                  <img
                      src={selectedStock.logo}
                      style={{ width: "25px", height: "25px", borderRadius: "50%" }}
                  />
                  </div>
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
                        <div>
                          <div className="growthPrediction">
                            Growth
                            <div
                                className="circle"
                                style={{
                                  backgroundColor:
                                      predictions[selectedStock.symbol]?.growth === true
                                          ? "green"
                                          : predictions[selectedStock.symbol]?.growth === false
                                              ? "red"
                                              : "gray",
                                  width: "13px",
                                  height: "13px",
                                  borderRadius: "50%",
                                  marginLeft: "5px",
                                }}
                            ></div>

                          </div>
                          <h2 className="aiPredictionResult">{aiPrediction}</h2>
                        </div>
                    ) : (
                        <button className="aiPrediction" onClick={fetchAIPrediction}>
                          AI Prediction
                        </button>
                    )}
                  </div>

                  {aiError && <p style={{ color: "red" }}>{aiError}</p>}
                  <button className="closeBtn" onClick={closeModal}>
                    Close
                  </button>
                </div>
              </div>
          )}
        </div>
      </>
  );
};

export default Table;
