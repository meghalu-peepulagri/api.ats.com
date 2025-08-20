function makeSlug(name: string) {
  // converting name to lower case then spaces replacing with '-'
  // removing other special chars
  return name.trim().toLowerCase().replace(/[ /&]/g, "-").replace(/[^\w-]+/g, "").replace(/(-)\1+/g, (str, match) => { // removing duplicate consecutive '-'
    return match[0];
  });
}

export function fileNameHelper(fileName: string) {
  let [fileOriginalName, fileExtension] = fileName.split(".");

  // Remove spaces and special characters from the fileOriginalName
  fileOriginalName = makeSlug(fileOriginalName);

  // Get the current date and format it
  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().split("T")[0];

  // Get the current time and format it (HHmmss)
  const formattedTime = currentDate.toTimeString().split(" ")[0].replace(/:/g, "");

  // Construct the unique filename with date and time
  const uniqueFileName = `${formattedDate}_${formattedTime}_${fileOriginalName}.${fileExtension}`;

  return uniqueFileName;
};

export function fileNameHelpers(fileName: string, fileType: string) {
  let [fileOriginalName, fileExtension] = fileName.split(".");

  // fallback: use fileType if extension is missing
  if (!fileExtension) {
    if (fileType.includes("/")) {
      fileExtension = fileType.split("/")[1];
    }
    else {
      fileExtension = fileType;
    }
  }

  // clean original name
  fileOriginalName = makeSlug(fileOriginalName);

  // date + time formatting
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, "");

  return `${fileOriginalName}_${timestamp}.${fileExtension}`;
}
