'use strict';
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');
const mkdirp = require('mkdirp');
const shell = require('shelljs');

module.exports = class extends Generator {
  prompting() {
    // Have Yeoman greet the user.
    this.log(
      yosay(
        `欢迎使用 ${chalk.red('generator-mybatis')} !`
      )
    );

    const prompts = [
      {
        type: 'input',
        name: 'groupId',
        message: '请输入创建工程的groupId',
        store: true
      },
      {
        type: 'input',
        name: 'artifactId',
        message: '请输入创建工程的artifactId',
        store: true
      },
      {
        type: 'input',
        name: 'version',
        message: '请输入创建工程的版本',
        default: '1.0-SNAPSHOT',
        store: true
      },
      {
        type: 'input',
        name: 'connVersion',
        message: '请输入mysql-connector-java的版本',
        store: true
      },
      {
        type: 'input',
        name: 'packageName',
        message: '请输入包名',
        default: ({ groupId, artifactId }) => groupId + "." + artifactId
      },
      {
        type: 'input',
        name: 'url',
        message: '请输入数据库连接URL',
        store: true
      },
      {
        type: 'input',
        name: 'user',
        message: '请输入用户名',
        store: true
      },
      {
        type: 'password',
        name: 'password',
        message: '请输入密码'
      },
      {
        type: 'input',
        name: 'tableNames',
        message: '请输入表名（示例：["A", "B", "C"]）',
        filter: function(val) {
          return JSON.parse(val);
        }
      },
      {
        type: 'input',
        name: 'serviceNames',
        message: ({ tableNames }) => '请输入对应的服务名（对应的表为:' + JSON.stringify(tableNames) + '）',
        default: ({ tableNames }) => {
          var list = [];
          for (var i = 0; i < tableNames.length; i++) {
            var serviceName = tableNames[i];
            serviceName = serviceName.substr(0, 1).toUpperCase() + serviceName.substr(1);
            while (serviceName.indexOf("_") > 0 && serviceName.indexOf("_") < serviceName.length - 1) {
              var index = serviceName.indexOf("_");
              serviceName = serviceName.substr(0, index) + serviceName.substr(index + 1, 1).toUpperCase() + serviceName.substr(index + 2);
            }
            list.push(serviceName);
          }
          return JSON.stringify(list);
        },
        filter: function(val) {
          return JSON.parse(val);
        }
      }
    ];

    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      this.props = props;
    });
  }

  writing() {
    this.fs.copyTpl(
      this.templatePath('pom.xml'),
      this.destinationPath(this.props.artifactId + '/pom.xml'),
      this.props
    );
    this.fs.copyTpl(
      this.templatePath('generatorConfig.xml'),
      this.destinationPath(this.props.artifactId + '/src/main/resources/generatorConfig.xml'),
      this.props
    );
    mkdirp.sync(
      this.destinationPath(this.props.artifactId + '/src/main/resources/mapper')
    );
    var packagePath = this.props.packageName;
    while (packagePath.indexOf('.') >= 0) {
      packagePath = packagePath.replace('.', '/');
    }
    mkdirp.sync(
      this.destinationPath(this.props.artifactId + '/src/main/java/' + packagePath + "/dao")
    );
    mkdirp.sync(
      this.destinationPath(this.props.artifactId + '/src/main/java/' + packagePath + "/entity")
    );
  }

  install() {
    shell.cd(this.destinationPath(this.props.artifactId));
    shell.exec('mvn mybatis-generator:generate');
  }
};
