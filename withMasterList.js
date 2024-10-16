const fs = require('fs');
const withMasterList = (config) => {
    withBuildSourceFile(config, {
        filePath: 'masterList.pem',
        contents: fs.readFileSync('assets/masterList.pem', 'utf8'),
        overwrite: true,
    });
};

module.exports = withMasterList;