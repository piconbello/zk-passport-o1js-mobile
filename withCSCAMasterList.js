
const { withXcodeProject, IOSConfig, withDangerousMod } = require('expo/config-plugins');
const path = require('path');

const fs = require('fs');
const withCSCAMasterList = (config) => {
    config = withXcodeProject(config, async (config) => {
        config.modResults = IOSConfig.XcodeUtils.addResourceFileToGroup({
            filepath: path.join('..', 'masterList.pem'),
            groupName: config.modRequest.projectName,
            // groupName: 'main',
            project: config.modResults,
            isBuildFile: true,
        });
        return config;
    });
    config = withDangerousMod(config, [
        'android',
        async (config) => {
            const assetsDir = path.join(config.modRequest.platformProjectRoot, 'app', 'src', 'main', 'assets');
            fs.mkdirSync(assetsDir, { recursive: true });
            fs.copyFileSync(path.join('.', 'masterList.pem'), path.join(assetsDir,'masterList.pem'));
            return config;
        }
    ])
    

    return config;
};

module.exports = withCSCAMasterList;