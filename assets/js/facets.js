// This JavaScript controls the expanding and contracting facet headers.
         

$(document).ready(function () {          
    $(".facet-bn").click(function (event) {
        $(this)
            .parent()
            .parent()
            .toggleClass("active");                  
        // this selector might return multiple elements
        $(this)
            .children("legend")
            .children(".facets-chevron")
            .toggleClass("facets-chevron-bottom facets-chevron-top");
    });

    // Sort options logic
    initSortOptions();
});


/*

This JavaScript code specifies the operation of the checkbox
filters in the collection_gallery.html include.

*/

// Selected facets
let facets = {};

// IDs of each facet fieldset
let setIds = [];

$("fieldset").each(function (i, e) {
  setIds.push(e.id);
});

// Number of fieldsets on the page
const numberFacets = setIds.length;

// Use each of them as a key for the 'facets' object. Each key gets an empty array,
// which will be used to store currently active checkboxes in that fieldset.
for (let i = 0; i < numberFacets; i++) {
  facets[setIds[i]] = new Array();
}

$("#facets :checkbox").change(function () {
  // Find the checkboxes parent fieldset id by taking its class name and adding "-set" to the end
  const pinClass = `${this.className}-set`;

  // Use fieldset id as key to facets object; add or remove current checkbox id
  // from the array for that key.
  if (this.checked) {
    facets[pinClass].push(this.id);
  } else {
    facets[pinClass] = facets[pinClass].filter((value) => value != this.id);
  }

  // After updating the facets object, rerun refreshGallery()
  refreshGallery();
});

/**
 * Shows / hides items based on active checkboxes
 */
function refreshGallery() {
  // Grab all gallery items
  let listOfElements = $(".gallery-item-facets");

  // Start by clearing the gallery of all items
  listOfElements.hide("slow");

  // Starting with the full list of all elements, loop through each fieldset
  // one at a time and keep only the elements that have one or more of the
  // desired values (based on checkboxes)
  // - loop through each fieldset in facets
  // - if the array is empty (e.g., no checkboxes checked), show all items
  // - if the array is not empty (e.g., one or more checkboxes checked),
  //   add only the items from the array to the list of desired values
  // - in both cases, add a "." before the checkbox id so it can be used as a
  //   jQuery selector
  // - take the list of checkbox values (treated as classes) and join them into
  //   a string with commas separating the class selectors. In jQuery, this will
  //   result in a selector that uses "OR" for the different classes in the list.
  // - filter the running list of elements to exclude elements that have none
  //   of the specified classes
  // - after finishing the for loop, take all remaining elements and show them
  for (let i = 0; i < numberFacets; i++) {
    let inputIds = [];
    if (facets[setIds[i]].length == 0) {
      // When no facets selected, instead of filtering by facet class
      // This will show everything including items that don't have any facet-set class
      inputIds.push('.gallery-item-facets');
    } else {
      inputIds = facets[setIds[i]].map((id) => "." + id );
    }
    listOfClasses = inputIds.join(",");
    listOfElements = listOfElements.filter($(`${listOfClasses}`));
  }
  listOfElements.show("slow");
}


/*
    SORT OPTIONS
    Client-side sorting of gallery items by data attributes.
*/

function initSortOptions() {
  const $sortRadios = $(".sort-option-radio");
  const $reverseCheckbox = $("#sort-reverse-checkbox");
  const $clearBtn = $("#sort-clear-btn");

  if ($sortRadios.length === 0) return;

  // Store the original DOM order so we can restore it on "Clear sort"
  const $galleryRow = $(".wax-gallery .row");
  const originalOrder = $galleryRow.children(".gallery-item-facets").toArray();

  $sortRadios.on("change", function () {
    sortGallery($galleryRow);
  });

  $reverseCheckbox.on("change", function () {
    // Only sort if a sort option is already selected
    if ($(".sort-option-radio:checked").length > 0) {
      sortGallery($galleryRow);
    }
  });

  $clearBtn.on("click", function () {
    // Uncheck radio and reverse checkbox
    $sortRadios.prop("checked", false);
    $reverseCheckbox.prop("checked", false);

    // Restore default sort order (the order from the server-rendered HTML,
    // which reflects the include's sortBy/sortOrder)
    var items = originalOrder.slice();
    $galleryRow.append(items);
  });
}

/**
 * Sorts gallery items based on the selected sort option and reverse checkbox.
 */
function sortGallery($galleryRow) {
  const selectedOption = $(".sort-option-radio:checked").val();
  if (!selectedOption) return;

  const isReversed = $("#sort-reverse-checkbox").is(":checked");
  const dataAttr = "data-sort-" + slugify(selectedOption);

  const $items = $galleryRow.children(".gallery-item-facets");
  const sorted = $items.toArray().sort(function (a, b) {
    const aVal = ($(a).attr(dataAttr) || "").toLowerCase();
    const bVal = ($(b).attr(dataAttr) || "").toLowerCase();

    // Try numeric comparison first
    const aNum = parseFloat(aVal);
    const bNum = parseFloat(bVal);
    if (!isNaN(aNum) && !isNaN(bNum)) {
      return aNum - bNum;
    }

    // Try date comparison
    const aDate = Date.parse(aVal);
    const bDate = Date.parse(bVal);
    if (!isNaN(aDate) && !isNaN(bDate)) {
      return aDate - bDate;
    }

    // Fall back to string comparison
    return aVal.localeCompare(bVal);
  });

  if (isReversed) {
    sorted.reverse();
  }

  $galleryRow.append(sorted);
}

/**
 * Replicates Jekyll's slugify filter for generating data attribute names.
 */
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
