
const { withXcodeProject, IOSConfig } = require('expo/config-plugins');

const fs = require('fs');
const withCSCAMasterList = (config) => {
    return withXcodeProject(config, async (config) => {
        config.modResults = IOSConfig.XcodeUtils.addResourceFileToGroup({
            filepath: '../masterList.pem',
            groupName: config.modRequest.projectName,
            // groupName: 'main',
            project: config.modResults,
            isBuildFile: true,
        });
        return config;
    });
};

module.exports = withCSCAMasterList;