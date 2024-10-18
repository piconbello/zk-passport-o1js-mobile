const PatchedAntdInput = require('./PatchedAntdInput');

require('@ant-design/react-native/lib/input').default = PatchedAntdInput.default;
require('@ant-design/react-native').Input = PatchedAntdInput.default;