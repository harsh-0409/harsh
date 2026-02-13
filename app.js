// Unified JavaScript for personal site

document.addEventListener("DOMContentLoaded", () => {
  
  const darkModeToggle = document.getElementById("dark-mode-toggle");
  const themeYes = document.getElementById("theme-yes");
  const themeNo = document.getElementById("theme-no");
  const htmlElement = document.documentElement;

  const savedMode = localStorage.getItem("colorMode");
  const isDark = savedMode === "dark";

  const updateTheme = (isDarkMode) => {
    if (isDarkMode) {
      htmlElement.setAttribute("data-theme", "dark");
      localStorage.setItem("colorMode", "dark");
      if (darkModeToggle) darkModeToggle.checked = true;
      if (themeYes) themeYes.checked = true;
      if (themeNo) themeNo.checked = false;

      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/atom-one-dark.min.css";
      document.head.appendChild(link);
    } else {
      htmlElement.removeAttribute("data-theme");
      localStorage.setItem("colorMode", "light");
      if (darkModeToggle) darkModeToggle.checked = false;
      if (themeYes) themeYes.checked = false;
      if (themeNo) themeNo.checked = true;
      
      const links = document.querySelectorAll('link[rel="stylesheet"]');
      links.forEach(link => {
        if (link.href.includes("atom-one-dark")) {
          link.remove();
        }
      });
    }
  };

  if (isDark) {
    updateTheme(true);
  }

  if (darkModeToggle) {
    darkModeToggle.addEventListener("change", () => {
      updateTheme(darkModeToggle.checked);
    });
  }

  if (themeYes) {
    themeYes.addEventListener("change", () => {
      if (themeYes.checked) {
        updateTheme(true);
      }
    });
  }
  
  if (themeNo) {
    themeNo.addEventListener("change", () => {
      if (themeNo.checked) {
        updateTheme(false);
      }
    });
  }

  const timeDisplay = document.getElementById("time-display");
  if (timeDisplay) {
    const updateTime = () => {
      const now = new Date();
      const spainTime = now.toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      
      const utcOffset = now.toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
        timeZoneName: "shortOffset",
      }).split(" ").pop();
      
      timeDisplay.textContent = `${spainTime} ${utcOffset}`;
    };

    updateTime();
    setInterval(updateTime, 1000);
  }

  const contributionsContainer = document.getElementById("contributions-chart");
  if (contributionsContainer) {
    const fetchGitHubContributions = async () => {
      try {
        const response = await fetch('https://github-contributions-api.jogruber.de/v4/aloyak?y=last');
        const data = await response.json();
        
        const contributions = [];
        const contributionMap = {};
        let totalContributions = 0;

        data.contributions.forEach(contribution => {
          contributionMap[contribution.date] = contribution.count;
          totalContributions += contribution.count;
        });

        // Generate full year with data
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 364);

        for (let i = 0; i < 365; i++) {
          const date = new Date(startDate);
          date.setDate(date.getDate() + i);
          const dateStr = date.toISOString().split('T')[0];
          const count = contributionMap[dateStr] || 0;
          contributions.push({ date: dateStr, count });
        }

        return { contributions, totalContributions };
      } catch (error) {
        console.error('Failed to fetch GitHub contributions:', error);
        return generateMockData();
      }
    };

    const generateMockData = () => {
      const contributions = [];
      let totalContributions = 0;
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 364);

      for (let i = 0; i < 365; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const count = Math.random() > 0.3 ? Math.floor(Math.random() * 11) : 0;
        totalContributions += count;
        contributions.push({ date: date.toISOString().split('T')[0], count });
      }
      return { contributions, totalContributions };
    };

    const getLevel = (count) => {
      if (count === 0) return 0;
      if (count <= 2) return 1;
      if (count <= 5) return 2;
      if (count <= 8) return 3;
      return 4;
    };

    const renderChart = (data, total) => {
      const weeks = [];
      for (let i = 0; i < data.length; i += 7) {
        weeks.push(data.slice(i, i + 7));
      }

      const grid = document.createElement('div');
      grid.className = 'pixel-grid';

      weeks.forEach(week => {
        const col = document.createElement('div');
        col.className = 'pixel-col';
        week.forEach(day => {
          const cell = document.createElement('div');
          cell.className = `pixel-cell level-${getLevel(day.count)}`;
          cell.title = `${day.count} contributions on ${day.date}`;
          col.appendChild(cell);
        });
        grid.appendChild(col);
      });

      contributionsContainer.appendChild(grid);

      const totalEl = document.createElement('div');
      totalEl.className = 'contributions-total';
      totalEl.textContent = `${total} Contributions This Year`;
      contributionsContainer.appendChild(totalEl);
    };

    fetchGitHubContributions().then(({ contributions, totalContributions }) => {
      renderChart(contributions, totalContributions);
    });
  }
});
