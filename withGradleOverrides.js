// https://github.com/expo/eas-cli/issues/2455#issuecomment-2224340546

const { withGradleProperties, withAppBuildGradle, AndroidConfig } = require('@expo/config-plugins');

const addCustomExcludes = (gradle, excludes) => {
    const lines = gradle.split('\n');
    let beginIndex = lines.length, endIndex = lines.length;
    for (let i = 0; i < lines.length; i++) {
        if (/\/\/\s*withGradleOverrides.addCustomExcludes BEGIN/g.test(lines[i])) {
            beginIndex = i;
        }
        if (/\/\/\s*withGradleOverrides.addCustomExcludes END/g.test(lines[i])) {
            endIndex = i + 1;
        }
    }
    const parseFun = `// withGradleOverrides.addCustomExcludes BEGIN
android {
    configurations {
        all {
${excludes.map(exclude => 
`           exclude ${exclude}`).join('\n')}
        }
    }
}
// withGradleOverrides.addCustomExcludes END
`;
    return [...lines.slice(0, beginIndex), parseFun, ...lines.slice(endIndex)].join('\n');
}

module.exports = (config) => {
    config = withGradleProperties(config, config => {
        // AndroidConfig.BuildProperties.updateAndroidBuildProperty(
        //     config.modResults,
        //     'android.jetifier.ignorelist',
        //     "bcprov-jdk15to18-1.70.jar"
        // );
        return config;
    });

    config = withAppBuildGradle(config, config => {
        config.modResults.contents = addCustomExcludes(config.modResults.contents, [
            "group: 'org.bouncycastle', module: 'bcutil-jdk15to18'",
            "group: 'org.bouncycastle', module: 'bcprov-jdk15to18'"
        ])
        return config;
    });
    return config;
}