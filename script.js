/**
 * 1. generateCards(jobs)
 *      Receives a list of jobs as a parameter, and then uses this information to create card elements displaying the job details.
 * 
 * 2. addTagEventListeners()
 *      Adds event listeners to each tag in every card.
 * 
 * 3. addTagToFilter()
 *      Ensures that tags are not duplicated.
 * 
 * 4. updateFilterTags()
 *      Updates the filter div by adding tags to it.
 * 
 * 5. createFilterTag()
 *      Responsible for creating the tag boxes inside the filter.
 * 
 * 6. removeFilterTag()
 *      Removes a tag from the filter by passing the type and value of the tag to be deleted.
 * 
 * 7. filterJobs()
 *      Filters the job array based on the selected categories.
 */



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

 
  filterContainer.classList.toggle("hide", !Object.values(selectedFilters).flat().length);

  const filterTags = tagsContainer.querySelectorAll(".filter-boxes");
  filterTags.forEach((tag) => {
    tag.addEventListener("click", () => {
      removeFilterTag(tag.dataset.type, tag.dataset.value);
    });
  });
}

function createFilterTag(type, value) {
  return `<span class="filter-boxes" data-type="${type}" data-value="${value}">${value} <i class="fa fa-times "></i></span>`;
}

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


document.querySelector(".clear").addEventListener("click", () => {
  selectedFilters = { role: null, level: null, languages: [], tools: [] };
  updateFilterTags();
  document.querySelector(".filter").classList.add("hide")
  generateCards(jobs); 
});