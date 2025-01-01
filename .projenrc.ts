import { yarn } from 'cdklabs-projen-project-types';
import * as pj from 'projen';

// 5.7 sometimes gives a weird error in `ts-jest` in `@aws-cdk/cli-lib-alpha`
// https://github.com/microsoft/TypeScript/issues/60159
const TYPESCRIPT_VERSION = '5.6';

const TEST_ENVIRONMENT = 'run-tests';

// This is for the test workflow, to know which artifacts to zip up
const ARTIFACTS_DIR = 'packages/@aws-cdk-testing/cli-integ/dist/js';

/**
 * Projen depends on TypeScript-eslint 7 by default.
 *
 * We want 8 for the parser, and 6 for the plugin (because after 6 some linter
 * rules we are relying on have been moved to another plugin).
 *
 * Also configure eslint plugins & rules, which cannot be configured by props.
 *
 * We also need to override the built-in prettier dependency to prettier@2, because
 * Jest < 30 can only work with prettier 2 (https://github.com/jestjs/jest/issues/14305)
 * and 30 is not stable yet.
 */
function configureProject<A extends pj.typescript.TypeScriptProject>(x: A): A {
  x.addDevDeps(
    '@typescript-eslint/eslint-plugin@^8',
    '@typescript-eslint/parser@^8',
    '@stylistic/eslint-plugin',
    '@cdklabs/eslint-plugin',
    'eslint-plugin-import',
    'eslint-plugin-jest',
  );
  x.eslint?.addPlugins(
    '@typescript-eslint',
    '@cdklabs',
    '@stylistic',
    'jest',
  );
  x.eslint?.addExtends(
    'plugin:jest/recommended',
  );
  x.eslint?.addIgnorePattern('*.generated.ts');
  x.eslint?.addIgnorePattern('resources/**/*.ts');
  x.eslint?.addRules({
    'jest/no-standalone-expect': 'off',
  });
  // x.eslint?.addRules(ESLINT_RULES);

  // Prettier needs to be turned off for now, there's too much code that doesn't conform to it
  x.eslint?.addRules({ 'prettier/prettier': ['off'] });

  x.addDevDeps('prettier@^2.8');
  return x;
}

const workflowRunsOn = [
  'ubuntu-latest',
  // 'awscdk-service-spec_ubuntu-latest_32-core',
];

/**
 * Generic CDK props
 *
 * Must be a function because the structures of jestConfig will be mutated
 * in-place inside projen
 */
function genericCdkProps() {
  return {
    keywords: ['aws', 'cdk'],
    homepage: 'https://github.com/aws/aws-cdk',
    authorName: 'Amazon Web Services',
    authorUrl: 'https://aws.amazon.com',
    authorOrganization: true,
    releasableCommits: pj.ReleasableCommits.featuresAndFixes('.'),
    jestOptions: {
      configFilePath: 'jest.config.json',
    },
    minNodeVersion: '16.0.0',
    prettierOptions: {
      settings: {
        printWidth: 120,
        singleQuote: true,
        trailingComma: pj.javascript.TrailingComma.ALL,
      },
    },
    typescriptVersion: TYPESCRIPT_VERSION,
  } satisfies Partial<yarn.TypeScriptWorkspaceOptions>;
}

const repo = configureProject(
  new yarn.Monorepo({
    projenrcTs: true,
    name: 'aws-cdk-cli-testing',
    description: "Monorepo for the AWS CDK's CLI testing",
    repository: 'https://github.com/aws/aws-cdk-cli-testing',

    defaultReleaseBranch: 'main',
    devDeps: [
      'cdklabs-projen-project-types@^0.1.215',
    ],

    eslintOptions: {
      // prettier: true,
      dirs: ['lib'],
      devdirs: ['test'],
      ignorePatterns: ['resources/**/*.ts'],
    },

    /*
    // Too many files don't match prettier
    prettier: true,
    prettierOptions: {
      settings: {
        printWidth: 120,
        singleQuote: true,
        trailingComma: pj.javascript.TrailingComma.ALL,
      },
    },
    */
    workflowNodeVersion: 'lts/*',
    workflowRunsOn,
    gitignore: ['.DS_Store'],

    autoApproveUpgrades: true,
    autoApproveOptions: {
      allowedUsernames: ['aws-cdk-automation', 'dependabot[bot]'],
    },

    release: true,
    releaseOptions: {
      publishToNpm: true,
      releaseTrigger: pj.release.ReleaseTrigger.scheduled({
        schedule: '11 8 * * 5',
      }),
    },

    githubOptions: {
      pullRequestLintOptions: {
        semanticTitleOptions: {
          types: ['feat', 'fix', 'chore', 'refactor'],
        },
      },
    },

    artifactsDirectory: ARTIFACTS_DIR,
  }),
);

new pj.github.AutoQueue(repo);

const cliInteg = configureProject(
  new yarn.TypeScriptWorkspace({
    ...genericCdkProps(),
    parent: repo,
    name: '@aws-cdk-testing/cli-integ',
    description: 'Integration tests for the AWS CDK CLI',

    // We set the majorVersion of this to 3.x, so that we can release
    // it already without interfering with the current crop of CDK
    // integ tests.
    majorVersion: 3,

    srcdir: '.',
    libdir: '.',
    deps: [
      '@octokit/rest@^18.12.0',
      '@aws-sdk/client-codeartifact@^3',
      '@aws-sdk/client-cloudformation@^3',
      '@aws-sdk/client-ecr@^3',
      '@aws-sdk/client-ecs@^3',
      '@aws-sdk/client-iam@^3',
      '@aws-sdk/client-lambda@^3',
      '@aws-sdk/client-s3@^3',
      '@aws-sdk/client-sns@^3',
      '@aws-sdk/client-sso@^3',
      '@aws-sdk/client-sts@^3',
      '@aws-sdk/credential-providers@^3',
      '@smithy/util-retry@^3',
      '@smithy/types@^3',
      'axios@^1',
      'chalk@^4',
      'fs-extra@^9',
      'glob@^7',
      'make-runnable@^1',
      'mockttp@^3',
      'npm@^8',
      'p-queue@^6',
      'semver@^7',
      'sinon@^9',
      'ts-mock-imports@^1',
      'yaml@1',
      'yargs@^17',
      // Jest is a runtime dependency here!
      'jest@^29',
      'jest-junit@^15',
      'ts-jest@^29',
    ],
    devDeps: [
      '@types/semver@^7',
      '@types/yargs@^15',
      '@types/fs-extra@^9',
      '@types/glob@^7',
    ],
    bin: {
      'run-suite': 'bin/run-suite',
      'download-and-run-old-tests': 'bin/download-and-run-old-tests',
      'query-github': 'bin/query-github',
      'apply-patches': 'bin/apply-patches',
      'test-root': 'bin/test-root',
      'stage-distribution': 'bin/stage-distribution',
    },
    tsconfig: {
      compilerOptions: {
        esModuleInterop: false,
      },
      include: ['**/*.ts'],
      exclude: ['resources/**/*'],
    },
  }),
);

const compiledDirs = ['tests', 'test', 'lib'];
for (const compiledDir of compiledDirs) {
  cliInteg.gitignore.addPatterns(`${compiledDir}/**/*.js`);
  cliInteg.gitignore.addPatterns(`${compiledDir}/**/*.d.ts`);
}
cliInteg.gitignore.addPatterns('!resources/**/*.js');

//////////////////////////////////////////////////////////////////////
// Add a job for running the tests to the global 'build' workflow

repo.buildWorkflow?.addPostBuildJob("run-tests", {
  environment: TEST_ENVIRONMENT,
  runsOn: workflowRunsOn,
  permissions: {
    contents: pj.github.workflows.JobPermission.READ,
    idToken: pj.github.workflows.JobPermission.WRITE,
  },
  env: {
    // Otherwise Maven is too noisy
    MAVEN_ARGS: '--no-transfer-progress',
  },
  strategy: {
    failFast: false,
    matrix: {
      domain: {
        suite: [
          'cli-integ-tests',
          'init-csharp',
          'init-fsharp',
          'init-go',
          'init-java',
          'init-javascript',
          'init-python',
          'init-typescript-app',
          'init-typescript-lib',
          'tool-integrations',
        ],
      },
    },
  },
  steps: [
    {
      name: 'Set up JDK 18',
      if: 'contains([\'init-java\', \'cli-integ-tests\'], matrix.suite)',
      uses: 'actions/setup-java@v4',
      with: {
        'java-version': '18',
        'distribution': 'corretto',
      },
    },
    {
      name: "Authenticate Via OIDC Role",
      id: "creds",
      uses: "aws-actions/configure-aws-credentials@v4",
      with: {
        "aws-region": "us-east-1",
        "role-duration-seconds": 3600,
        // Expect this in Environment Variables
        "role-to-assume": "${{ vars.AWS_ROLE_TO_ASSUME_FOR_TESTING }}",
        "role-session-name": "run-tests@aws-cdk-cli-integ",
        "output-credentials": true,
      },
    },
    // This is necessary for the init tests to succeed, they set up a git repo.
    {
      name: 'Set git identity',
      run: [
        'git config --global user.name "aws-cdk-cli-integ"',
        'git config --global user.email "noreply@example.com"',
      ].join('\n'),
    },
    {
      name: "Download and install the test artifact",
      run: [
        `npm install --no-save ${ARTIFACTS_DIR}/*.tgz`,
        // Move the installed files to the current directory, because as
        // currently configured the tests won't run from an installed
        // node_modules directory.
        "mv $(./node_modules/.bin/test-root)/* .",
      ].join("\n"),
    },
    {
      name: "Determine latest CLI version",
      id: 'cli_version',
      run: [
        "CLI_VERSION=$(cd ${TMPDIR:-/tmp} && npm view aws-cdk version)",
        'echo "CLI version: ${CLI_VERSION}"',
        'echo "cli_version=${CLI_VERSION}" >> $GITHUB_OUTPUT',
      ].join('\n'),

    },
    {
      name: "Run the test suite: ${{ matrix.suite }}",
      run: "bin/run-suite --use-cli-release=${{ steps.cli_version.outputs.cli_version }} --verbose ${{ matrix.suite }}",
    },
  ],
});

repo.synth();
