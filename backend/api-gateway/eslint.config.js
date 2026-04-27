const eslintPluginSecurity = require("eslint-plugin-security");
const js = require("@eslint/js");

module.exports = [
    js.configs.recommended,
    eslintPluginSecurity.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "commonjs",
            globals: {
                console: true,
                process: true,
                module: true,
                require: true,
                __dirname: true,
                exports: true,
            }
        },
        rules: {
            "no-unused-vars": "off",
            "security/detect-object-injection": "warn"
        }
    }
];
