/* =====================================================
   CHRONOX
   DIGITAL CLOCK + STOPWATCH
===================================================== */


/* =====================================================
   DIGITAL CLOCK
===================================================== */

const timeElement = document.getElementById("time");
const dateElement = document.getElementById("date");
const timezoneElement = document.getElementById("timezone");


function updateClock() {

    const now = new Date();

    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();

    hours = String(hours).padStart(2, "0");
    minutes = String(minutes).padStart(2, "0");
    seconds = String(seconds).padStart(2, "0");

    timeElement.textContent =
        `${hours}:${minutes}:${seconds}`;


    const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    };

    dateElement.textContent =
        now.toLocaleDateString("en-US", options);


    timezoneElement.textContent =
        Intl.DateTimeFormat()
            .resolvedOptions()
            .timeZone
            .split("/")
            .pop()
            .replace("_", " ");
}


updateClock();

setInterval(updateClock, 1000);


/* =====================================================
   STOPWATCH VARIABLES
===================================================== */

let startTime = 0;

let elapsedTime = 0;

let timerInterval = null;

let isRunning = false;

let laps = [];

let previousLapTime = 0;


/* =====================================================
   ELEMENTS
===================================================== */

const minutesElement =
    document.getElementById("minutes");

const secondsElement =
    document.getElementById("seconds");

const millisecondsElement =
    document.getElementById("milliseconds");

const startBtn =
    document.getElementById("startBtn");

const lapBtn =
    document.getElementById("lapBtn");

const resetBtn =
    document.getElementById("resetBtn");

const clearLapsBtn =
    document.getElementById("clearLapsBtn");

const lapList =
    document.getElementById("lapList");

const lapCounter =
    document.getElementById("lapCounter");

const stopwatchStatus =
    document.getElementById("stopwatchStatus");

const bestLap =
    document.getElementById("bestLap");

const averageLap =
    document.getElementById("averageLap");

const totalLaps =
    document.getElementById("totalLaps");

const progressCircle =
    document.getElementById("progressCircle");


/* =====================================================
   FORMAT TIME
===================================================== */

function formatTime(time) {

    const minutes =
        Math.floor(time / 60000);

    const seconds =
        Math.floor((time % 60000) / 1000);

    const milliseconds =
        Math.floor((time % 1000) / 10);


    return (
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0") +
        ":" +
        String(milliseconds).padStart(2, "0")
    );
}


/* =====================================================
   UPDATE STOPWATCH DISPLAY
===================================================== */

function updateStopwatch() {

    const minutes =
        Math.floor(elapsedTime / 60000);

    const seconds =
        Math.floor((elapsedTime % 60000) / 1000);

    const milliseconds =
        Math.floor((elapsedTime % 1000) / 10);


    minutesElement.textContent =
        String(minutes).padStart(2, "0");

    secondsElement.textContent =
        String(seconds).padStart(2, "0");

    millisecondsElement.textContent =
        String(milliseconds).padStart(2, "0");


    /*
        Progress ring

        It completes every 60 seconds.
    */

    const circumference = 578;

    const progress =
        (elapsedTime % 60000) / 60000;

    const offset =
        circumference -
        progress * circumference;

    progressCircle.style.strokeDashoffset =
        offset;
}


/* =====================================================
   START / PAUSE
===================================================== */

function toggleStopwatch() {

    if (!isRunning) {

        /*
            START
        */

        startTime =
            Date.now() - elapsedTime;

        timerInterval =
            setInterval(() => {

                elapsedTime =
                    Date.now() - startTime;

                updateStopwatch();

            }, 10);

        isRunning = true;


        startBtn.innerHTML =
            "<span>Ⅱ</span> Pause";

        stopwatchStatus.textContent =
            "RUNNING";

        stopwatchStatus.classList.remove("paused");

        stopwatchStatus.classList.add("running");

        lapBtn.disabled = false;

    }

    else {

        /*
            PAUSE
        */

        clearInterval(timerInterval);

        isRunning = false;


        startBtn.innerHTML =
            "<span>▶</span> Resume";

        stopwatchStatus.textContent =
            "PAUSED";

        stopwatchStatus.classList.remove("running");

        stopwatchStatus.classList.add("paused");

    }
}


/* =====================================================
   RECORD LAP
===================================================== */

function recordLap() {

    if (!isRunning) {
        return;
    }


    const lapTime =
        elapsedTime - previousLapTime;


    previousLapTime =
        elapsedTime;


    const lap = {

        number: laps.length + 1,

        lapTime: lapTime,

        totalTime: elapsedTime

    };


    laps.push(lap);


    updateLapTable();

    updateStatistics();

    updateLapCounter();
}


/* =====================================================
   LAP TABLE
===================================================== */

function updateLapTable() {

    if (laps.length === 0) {

        lapList.innerHTML = `

            <tr class="empty-row">

                <td colspan="4">

                    <div class="empty-state">

                        <div>🏁</div>

                        <p>No lap times yet</p>

                        <small>
                            Start the stopwatch and press Lap
                        </small>

                    </div>

                </td>

            </tr>

        `;

        return;
    }


    /*
        Newest lap appears first.
    */

    lapList.innerHTML = "";


    [...laps].reverse().forEach((lap, index) => {

        const row =
            document.createElement("tr");


        const difference =
            lap.lapTime -
            getPreviousLapTime(lap.number);


        let differenceText =
            "--";


        if (lap.number > 1) {

            const sign =
                difference > 0 ? "+" : "";

            differenceText =
                sign + formatTime(Math.abs(difference));

        }


        row.innerHTML = `

            <td>
                <strong>
                    #${lap.number}
                </strong>
            </td>

            <td>
                ${formatTime(lap.lapTime)}
            </td>

            <td>
                ${formatTime(lap.totalTime)}
            </td>

            <td>
                ${differenceText}
            </td>

        `;


        lapList.appendChild(row);

    });
}


/* =====================================================
   PREVIOUS LAP
===================================================== */

function getPreviousLapTime(number) {

    if (number <= 1) {
        return 0;
    }


    const previousLap =
        laps.find(
            lap => lap.number === number - 1
        );


    return previousLap
        ? previousLap.lapTime
        : 0;
}


/* =====================================================
   STATISTICS
===================================================== */

function updateStatistics() {

    if (laps.length === 0) {

        bestLap.textContent = "--:--:--";

        averageLap.textContent = "--:--:--";

        totalLaps.textContent = "0";

        return;
    }


    /*
        BEST LAP
    */

    const best =
        Math.min(
            ...laps.map(lap => lap.lapTime)
        );


    bestLap.textContent =
        formatTime(best);


    /*
        AVERAGE LAP
    */

    const total =
        laps.reduce(
            (sum, lap) =>
                sum + lap.lapTime,
            0
        );


    const average =
        total / laps.length;


    averageLap.textContent =
        formatTime(average);


    /*
        TOTAL LAPS
    */

    totalLaps.textContent =
        laps.length;
}


/* =====================================================
   LAP COUNTER
===================================================== */

function updateLapCounter() {

    lapCounter.textContent =
        `${laps.length} ${
            laps.length === 1
                ? "LAP"
                : "LAPS"
        }`;
}


/* =====================================================
   RESET STOPWATCH
===================================================== */

function resetStopwatch() {

    clearInterval(timerInterval);


    elapsedTime = 0;

    startTime = 0;

    previousLapTime = 0;

    isRunning = false;

    laps = [];


    updateStopwatch();

    updateLapTable();

    updateStatistics();

    updateLapCounter();


    startBtn.innerHTML =
        "<span>▶</span> Start";


    lapBtn.disabled = true;


    stopwatchStatus.textContent =
        "READY";

    stopwatchStatus.classList.remove("running");

    stopwatchStatus.classList.add("paused");
}


/* =====================================================
   CLEAR LAPS
===================================================== */

function clearLaps() {

    laps = [];

    previousLapTime = elapsedTime;

    updateLapTable();

    updateStatistics();

    updateLapCounter();
}


/* =====================================================
   BUTTON EVENTS
===================================================== */

startBtn.addEventListener(
    "click",
    toggleStopwatch
);


lapBtn.addEventListener(
    "click",
    recordLap
);


resetBtn.addEventListener(
    "click",
    resetStopwatch
);


clearLapsBtn.addEventListener(
    "click",
    clearLaps
);


/* =====================================================
   THEME
===================================================== */

const themeBtn =
    document.getElementById("themeBtn");


themeBtn.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "light"
        );


        if (
            document.body.classList.contains(
                "light"
            )
        ) {

            themeBtn.textContent = "🌙";

        }

        else {

            themeBtn.textContent = "☀";

        }

    }
);


/* =====================================================
   FULLSCREEN
===================================================== */

const fullscreenBtn =
    document.getElementById("fullscreenBtn");


fullscreenBtn.addEventListener(
    "click",
    toggleFullscreen
);


function toggleFullscreen() {

    if (!document.fullscreenElement) {

        document.documentElement.requestFullscreen();

    }

    else {

        document.exitFullscreen();

    }
}


/* =====================================================
   KEYBOARD SHORTCUTS
===================================================== */

document.addEventListener(
    "keydown",
    (event) => {

        /*
            Ignore shortcuts when typing.
        */

        if (
            event.target.tagName === "INPUT" ||
            event.target.tagName === "TEXTAREA"
        ) {
            return;
        }


        /*
            SPACE
            Start / Pause
        */

        if (event.code === "Space") {

            event.preventDefault();

            toggleStopwatch();

        }


        /*
            L
            Record lap
        */

        if (
            event.key.toLowerCase() === "l"
        ) {

            recordLap();

        }


        /*
            R
            Reset
        */

        if (
            event.key.toLowerCase() === "r"
        ) {

            resetStopwatch();

        }


        /*
            F
            Fullscreen
        */

        if (
            event.key.toLowerCase() === "f"
        ) {

            toggleFullscreen();

        }

    }
);


/* =====================================================
   INITIAL STATE
===================================================== */

updateStopwatch();

updateStatistics();

updateLapCounter();