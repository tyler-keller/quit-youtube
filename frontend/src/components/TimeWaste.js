import { useState, useEffect, useCallback } from "react";

function TimeWaste() {
    const [fileContent, setFileContent] = useState(null);
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(false); // track loading state
    const [error, setError] = useState(null); // track error state


    const sendToApi = useCallback(async (data) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch("https://api.quityoutube.com/scrape-watch-history/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ watch_history: data }),
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }

            const apiResponse = await response.json();
            console.log(`LOG: scrape-watch-history response: ${apiResponse}`);
            calculateMetrics(apiResponse.data);
        } catch (err) {
            console.error("API request failed:", err);
            setError("Failed to process data via the API. Please try again later.");
        } finally {
            setLoading(false);
        }
    }, []); // empty dependency array ensures sendToApi remains stable


    // load saved data from localstorage on component mount
    useEffect(() => {
        const savedData = localStorage.getItem("watchHistoryData");
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            setFileContent(parsedData);
            sendToApi(parsedData); // send saved data to the api
        }
    }, [sendToApi]);

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    setFileContent(data);

                    // save to localstorage
                    // localStorage.setItem("watchHistoryData", JSON.stringify(data));

                    // send data to the api
                    sendToApi(data);
                } catch (error) {
                    console.error("error parsing file:", error);
                    setError("Failed to parse JSON file. Please try again.");
                }
            };
            reader.readAsText(file);
        }
    };

    const calculateMetrics = (data) => {
        // calculate total time spent
        const totalTime = data.reduce((acc, item) => {
            const length = parseInt(item.length_seconds, 10);
            return acc + (isNaN(length) ? 0 : length);
        }, 0);

        // find the top creator
        const creators = data.reduce((acc, item) => {
            const creator = item.channel_name || "Unknown Creator";
            acc[creator] = (acc[creator] || 0) + 1;
            return acc;
        }, {});

        const topCreator = Object.keys(creators).reduce((a, b) =>
            creators[a] > creators[b] ? a : b
        );

        setMetrics({
            totalTime: (totalTime / 3600).toFixed(2), // convert seconds to hours
            topCreator,
        });
    };

    const handleClearData = () => {
        localStorage.removeItem("watchHistoryData");
        setFileContent(null);
        setMetrics(null);
    };

    return (
        <aside className="time-waste-container">
            <h1>well, this is how much time you've lost to youtube consumption:</h1>
            {loading && <p>processing your data, please wait...</p>}
            {error && <p className="error-message">{error}</p>}
            {!fileContent && (
                <>
                    <p>upload your `watch-history.json` file from google takeout to analyze your time waste.</p>
                    <input type="file" accept=".json" onChange={handleFileUpload} />
                </>
            )}
            {metrics && (
                <>
                    <h3>video breakdown:</h3>
                    <h4>top creator: {metrics.topCreator}</h4>
                    <h3>time waste: {metrics.totalTime} hours</h3>
                    <button onClick={handleClearData}>clear data</button>
                    <p>or update your data by reuploading a new file:</p>
                    <input type="file" accept=".json" onChange={handleFileUpload} />
                </>
            )}
        </aside>
    );
}

export default TimeWaste;
