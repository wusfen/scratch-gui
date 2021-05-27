const sonarqubeScanner = require('sonarqube-scanner')

sonarqubeScanner(
  {
    options: {
      'sonar.projectKey': process.env.CI_PROJECT_NAME,
      'sonar.login': process.env.SONAR_ADMIN_TOKEN,
      'sonar.host.url': process.env.SONAR_HOST_URL,
      'sonar.analysis.gitlab.projectId': process.env.CI_PROJECT_ID,
      'sonar.analysis.branch': process.env.CI_COMMIT_REF_NAME,
      'sonar.analysis.gitlab.pipelineId': process.env.CI_PIPELINE_ID,
      'sonar.eslint.reportPaths': 'lint.json', // eslint验证输出的json文件
    },
  },
  () => process.exit()
)
