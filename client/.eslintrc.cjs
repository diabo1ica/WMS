module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:react/recommended"
    ],
    "overrides": [
        {
            "env": {
                "node": true
            },
            "files": [
                ".eslintrc.{js,cjs,}",
                "*.ts", 
                "*.tsx"
            ],
            "parserOptions": {
                "sourceType": "script"
            },
            "rules": {
                "react/prop-types": "off"
            }
        }
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "plugins": [
        "@typescript-eslint",
        "react"
    ],
    "rules": {
        "no-unused-expressions": "off",
        "@typescript-eslint/no-unused-expressions": ["error"],
        "react/react-in-jsx-scope": "off",
        "react/jsx-uses-react": "off",
        "react/jsx-uses-vars": "error"
    },
    "settings": {
        "react": {
          "version": "detect",
          "pragma": "React",
          "runtime": "automatic"
        }
    },
}
