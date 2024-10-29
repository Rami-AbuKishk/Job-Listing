// Initialize job data and filters

let jobs = [];
let selectedFilters = {
  role: null,
  level: null,
  languages: [],
  tools: []
};

fetch("data.json")
  .then((response) => response.json())
  .then((data) => {
    jobs = data;
    generateCards(jobs);
  })
  .catch((error) => {
    console.error("Error fetching jobs:", error);
  });

// Fetch job data from JSON and generate initial job cards


function generateCards(jobs) {
  const container = document.getElementById("list");
  container.innerHTML = "";

  jobs.forEach((job) => {
    const jobCardHTML = `
            <div class="card col-10" data-role="${job.role}" data-level="${job.level}" data-languages="${job.languages.join(" ")}" data-tools="${job.tools.join(" ")}">
                <img class="mobile-image"src="${job.logo}" alt="${job.company}">
                <div class="main-info">
                    <img src="${job.logo}" alt="${job.company}">
                    <div class="info">
                        <div class="post-info">
                            <span class="comp-title">${job.company}</span>
                            ${job.new ? '<span class="new">NEW!</span>' : ""}
                            ${job.featured ? '<span class="featured">FEATURED</span>' : ""}
                        </div>
                        <span class="position">${job.position}</span>
                        <div class="general-info">
                            ${job.postedAt} . ${job.contract} . ${job.location}
                        </div>
                    </div>
                </div>
                <div class="role-info">
                    <span class="tag role">${job.role}</span>
                    <span class="tag level">${job.level}</span>
                    ${job.languages.map((language) => `<span class="tag languages">${language}</span>`).join("")}
                    ${job.tools.map((tool) => `<span class="tag tools">${tool}</span>`).join("")}
                </div>
            </div>
        `;

    container.innerHTML += jobCardHTML;
  });

  addTagEventListeners();
}

// Add event listeners for each tag to filter by selected categories
function addTagEventListeners() {
  const tags = document.querySelectorAll(".tag");
  tags.forEach((tag) => {
    tag.addEventListener("click", (event) => {
      const tagType = event.target.classList.contains("role")
        ? "role"
        : event.target.classList.contains("level")
        ? "level"
        : event.target.classList.contains("languages")
        ? "languages"
        : "tools";
      const tagValue = event.target.textContent.trim();
      addTagToFilter(tagType, tagValue);
    });
  });
}


// Add selected tag to filter and refresh the display
function addTagToFilter(type, value) {
  if (type === "role" || type === "level") {
    selectedFilters[type] = value;
  } else {
    if (!selectedFilters[type].includes(value)) {
      selectedFilters[type].push(value);
    }
  }
  
  updateFilterTags();
  filterJobs();
}

// Update filter tag display and add remove functionality
function updateFilterTags() {
  const filterContainer = document.querySelector(".filter");
  const tagsContainer = filterContainer.querySelector(".tags");
  tagsContainer.innerHTML = "";


  Object.entries(selectedFilters).forEach(([type, values]) => {
    if (type === "role" || type === "level") {
      if (values) tagsContainer.innerHTML += createFilterTag(type, values);
    } else {
      values.forEach((value) => {
        tagsContainer.innerHTML += createFilterTag(type, value);
      });
    }
  });

  // Toggle filter container visibility
  filterContainer.classList.toggle("hide", !Object.values(selectedFilters).flat().length);

  const filterTags = tagsContainer.querySelectorAll(".filter-boxes");
  filterTags.forEach((tag) => {
    tag.addEventListener("click", () => {
      removeFilterTag(tag.dataset.type, tag.dataset.value);
    });
  });
}


// Create individual filter tag HTML
function createFilterTag(type, value) {
  return `<span class="filter-boxes" data-type="${type}" data-value="${value}">${value} <i class="fa fa-times "></i></span>`;
}


// Remove tag from filter and update job display
function removeFilterTag(type, value) {
  if (type === "role" || type === "level") {
    selectedFilters[type] = null;
  } else {
    selectedFilters[type] = selectedFilters[type].filter((item) => item !== value);
  }
  updateFilterTags();
  if(!selectedFilters.role &&
    !selectedFilters.level &&
    selectedFilters.languages.length === 0 &&
    selectedFilters.tools.length === 0)
        document.querySelector(".filter").classList.add("hide")
  filterJobs();
}


// Filter jobs based on selected filters and regenerate job cards
function filterJobs() {
  const filteredJobs = jobs.filter((job) => {
    const matchesRole = !selectedFilters.role || job.role === selectedFilters.role;
    const matchesLevel = !selectedFilters.level || job.level === selectedFilters.level;
    const matchesLanguages = selectedFilters.languages.every((lang) => job.languages.includes(lang));
    const matchesTools = selectedFilters.tools.every((tool) => job.tools.includes(tool));

    return matchesRole && matchesLevel && matchesLanguages && matchesTools;
  });

  generateCards(filteredJobs);
}

// Clear all filters and reset job display
document.querySelector(".clear").addEventListener("click", () => {
  selectedFilters = { role: null, level: null, languages: [], tools: [] };
  updateFilterTags();
  document.querySelector(".filter").classList.add("hide")
  generateCards(jobs); 
});