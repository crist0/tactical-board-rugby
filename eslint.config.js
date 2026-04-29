import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import prettier from '@vue/eslint-config-prettier'

export default [
  js.configs.recommended,
  ...vue.configs['flat/essential'],
  prettier,
  {
    ignores: ['dist', 'node_modules', '*.local']
  },
  {
    files: ['**/*.vue', '**/*.js', '**/*.jsx', '**/*.cjs', '**/*.mjs'],
    rules: {
      'vue/multi-word-component-names': 'off'
    }
  }
]
