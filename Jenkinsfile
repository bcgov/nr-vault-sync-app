node {
    stage('Checkout code') {
        checkout([
            $class: 'GitSCM',
            branches: [[name: '*/master']],
            doGenerateSubmoduleConfigurations: false,
            extensions: [],
            submoduleCfg: [],
            userRemoteConfigs: [
                [
                    credentialsId: 'bitbucket-ci',
                    url: 'https://bwa.nrs.gov.bc.ca/int/stash/scm/appdev/vault-policy.git'
                ]
            ]
        ])
    }
    stage('NodeJS Install') {
        NODEJS_HOME = tool name: 'Node', type: 'jenkins.plugins.nodejs.tools.NodeJSInstallation'
        env.PATH = "${NODEJS_HOME}/bin:${env.PATH}"
    }
    stage('Install Dependencies') {
        sh 'npm install'
    }
    stage('Run') {
        env.VAULT_ADDR = 'https://vault-csnr-devops-lab-deploy.pathfinder.gov.bc.ca'
        withCredentials([string(credentialsId: 'vault-token', variable: 'TOKEN')]) {
            env.VAULT_TOKEN = TOKEN
        }
        sh 'npm start'
    }
}