// https://github.com/expo/eas-cli/issues/2455#issuecomment-2224340546

const { withGradleProperties, withAppBuildGradle, AndroidConfig, withProjectBuildGradle } = require('@expo/config-plugins');

const addCustomHelper = (name, value) => (gradle) => {
    const lines = gradle.split('\n');
    let beginIndex = lines.length, endIndex = lines.length;
    const beginLine = `// withGradleOverrides.${name} BEGIN`;
    const endLine = `// withGradleOverrides.${name} BEGIN`;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim() === beginLine) {
            beginIndex = i;
        }
        if (lines[i].trim() === endLine) {
            endIndex = i + 1;
        }
    }
    const patch = `${beginLine}\n${value}\n${endLine}\n`;
    return [...lines.slice(0, beginIndex), patch, ...lines.slice(endIndex)].join('\n');
}

const addCustomExcludes = (gradle, excludes) => addCustomHelper('addCustomExcludes', 
`android {
    configurations {
        all {
${excludes.map(exclude => 
`           exclude ${exclude}`).join('\n')}
        }
    }
}`)(gradle);

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
        ]);
        return config;
    });

    config = withProjectBuildGradle(config, config => {
        return config;
    });

    return config;
}