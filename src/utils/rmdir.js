const fs = require('fs-extra');

// Get the relative path of the folder from the command line arguments
const folderToDelete = process.argv[2];

if (!folderToDelete) {
  console.error('You must provide the folder path to delete as an argument.');
  process.exit(1);
}

fs.remove(folderToDelete)
  .then(() => {
    console.log('Folder deleted successfully.');
  })
  .catch((err) => {
    console.error('Error deleting the folder:', err);
  });
