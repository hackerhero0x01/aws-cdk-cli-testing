"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-console */
const path = require("path");
const jest = require("jest");
const yargs = require("yargs");
const release_source_1 = require("../lib/package-sources/release-source");
const repo_source_1 = require("../lib/package-sources/repo-source");
const subprocess_1 = require("../lib/package-sources/subprocess");
async function main() {
    var _a;
    const args = await yargs
        .usage('$0 <SUITENAME>')
        .positional('SUITENAME', {
        descripton: 'Name of the test suite to run',
        type: 'string',
        demandOption: true,
    })
        .option('test', {
        descripton: 'Test pattern to selectively run tests',
        alias: 't',
        type: 'string',
        requiresArg: true,
    })
        .option('test-file', {
        description: 'The specific test file to run',
        type: 'string',
        requiresArg: true,
    })
        .option('use-source', {
        descripton: 'Use TypeScript packages from the given source repository (or "auto")',
        alias: 's',
        type: 'string',
        requiresArg: true,
    })
        .option('use-cli-release', {
        descripton: 'Run the current tests against the CLI at the given version',
        alias: 'u',
        type: 'string',
        requiresArg: true,
    })
        .option('auto-source', {
        alias: 'a',
        description: 'Automatically find the source tree from the current working directory',
        type: 'boolean',
        requiresArg: false,
    })
        .option('runInBand', {
        descripton: 'Run all tests in one Node process',
        alias: 'i',
        type: 'boolean',
    })
        .options('framework-version', {
        description: 'Framework version to use, if different than the CLI version (not all suites respect this)',
        alias: 'f',
        type: 'string',
    })
        .options('verbose', {
        alias: 'v',
        description: 'Run in verbose mode',
        type: 'boolean',
        requiresArg: false,
    })
        .options('passWithNoTests', {
        description: 'Allow passing if the test suite is not found (default true when IS_CANARY mode, false otherwise)',
        type: 'boolean',
        requiresArg: false,
    })
        .help()
        .showHelpOnFail(false)
        .argv;
    const suiteName = args._[0];
    if (!suiteName) {
        throw new Error('Usage: run-suite <SUITENAME>');
    }
    let packageSource;
    function usePackageSource(s) {
        if (packageSource) {
            throw new Error('Cannot specify two package sources');
        }
        packageSource = s;
    }
    if (args['use-source'] || args['auto-source']) {
        if (args['framework-version']) {
            throw new Error('Cannot use --framework-version with --use-source');
        }
        const root = args['use-source'] && args['use-source'] !== 'auto'
            ? args['use-source']
            : await (0, repo_source_1.autoFindRoot)();
        usePackageSource(new repo_source_1.RepoPackageSourceSetup(root));
    }
    else if (args['use-cli-release']) {
        usePackageSource(new release_source_1.ReleasePackageSourceSetup(args['use-cli-release'], args['framework-version']));
    }
    if (!packageSource) {
        throw new Error('Specify either --use-source or --use-cli-release');
    }
    console.log(`Package source: ${packageSource.description}`);
    console.log(`Test suite:     ${suiteName}`);
    await packageSource.prepare();
    (0, subprocess_1.serializeForSubprocess)(packageSource);
    if (args.verbose) {
        process.env.VERBOSE = '1';
    }
    // Motivation behind this behavior: when adding a new test suite to the pipeline, because of the way our
    // Pipeline package works, the suite would be added to the pipeline AND as a canary immediately. The canary
    // would fail until the package was actually released, so for canaries we make an exception so that the initial
    // canary would succeed even if the suite wasn't yet available. The fact that the suite is not optional in
    // the pipeline protects us from typos.
    const passWithNoTests = (_a = args.passWithNoTests) !== null && _a !== void 0 ? _a : !!process.env.IS_CANARY;
    // Communicate with the config file (integ.jest.config.js)
    process.env.TEST_SUITE_NAME = suiteName;
    try {
        await jest.run([
            ...args.runInBand ? ['-i'] : [],
            ...args.test ? ['-t', args.test] : [],
            ...args.verbose ? ['--verbose'] : [],
            ...passWithNoTests ? ['--passWithNoTests'] : [],
            ...args['test-file'] ? [args['test-file']] : [],
        ], path.resolve(__dirname, '..', 'resources', 'integ.jest.config.js'));
    }
    finally {
        await packageSource.cleanup();
    }
}
main().catch(e => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exitCode = 1;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVuLXN1aXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicnVuLXN1aXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsK0JBQStCO0FBQy9CLDZCQUE2QjtBQUM3Qiw2QkFBNkI7QUFDN0IsK0JBQStCO0FBQy9CLDBFQUFrRjtBQUNsRixvRUFBMEY7QUFFMUYsa0VBQTJFO0FBRTNFLEtBQUssVUFBVSxJQUFJOztJQUNqQixNQUFNLElBQUksR0FBRyxNQUFNLEtBQUs7U0FDckIsS0FBSyxDQUFDLGdCQUFnQixDQUFDO1NBQ3ZCLFVBQVUsQ0FBQyxXQUFXLEVBQUU7UUFDdkIsVUFBVSxFQUFFLCtCQUErQjtRQUMzQyxJQUFJLEVBQUUsUUFBUTtRQUNkLFlBQVksRUFBRSxJQUFJO0tBQ25CLENBQUM7U0FDRCxNQUFNLENBQUMsTUFBTSxFQUFFO1FBQ2QsVUFBVSxFQUFFLHVDQUF1QztRQUNuRCxLQUFLLEVBQUUsR0FBRztRQUNWLElBQUksRUFBRSxRQUFRO1FBQ2QsV0FBVyxFQUFFLElBQUk7S0FDbEIsQ0FBQztTQUNELE1BQU0sQ0FBQyxXQUFXLEVBQUU7UUFDbkIsV0FBVyxFQUFFLCtCQUErQjtRQUM1QyxJQUFJLEVBQUUsUUFBUTtRQUNkLFdBQVcsRUFBRSxJQUFJO0tBQ2xCLENBQUM7U0FDRCxNQUFNLENBQUMsWUFBWSxFQUFFO1FBQ3BCLFVBQVUsRUFBRSxzRUFBc0U7UUFDbEYsS0FBSyxFQUFFLEdBQUc7UUFDVixJQUFJLEVBQUUsUUFBUTtRQUNkLFdBQVcsRUFBRSxJQUFJO0tBQ2xCLENBQUM7U0FDRCxNQUFNLENBQUMsaUJBQWlCLEVBQUU7UUFDekIsVUFBVSxFQUFFLDREQUE0RDtRQUN4RSxLQUFLLEVBQUUsR0FBRztRQUNWLElBQUksRUFBRSxRQUFRO1FBQ2QsV0FBVyxFQUFFLElBQUk7S0FDbEIsQ0FBQztTQUNELE1BQU0sQ0FBQyxhQUFhLEVBQUU7UUFDckIsS0FBSyxFQUFFLEdBQUc7UUFDVixXQUFXLEVBQUUsdUVB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QUFDdkIsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlICovXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgamVzdCBmcm9tICdqZXN0JztcbmltcG9ydCAqIGFzIHlhcmdzIGZyb20gJ3lhcmdzJztcbmltcG9ydCB7IFJlbGVhc2VQYWNrYWdlU291cmNlU2V0dXAgfSBmcm9tICcuLi9saWIvcGFja2FnZS1zb3VyY2VzL3JlbGVhc2Utc291cmNlJztcbmltcG9ydCB7IFJlcG9QYWNrYWdlU291cmNlU2V0dXAsIGF1dG9GaW5kUm9vdCB9IGZyb20gJy4uL2xpYi9wYWNrYWdlLXNvdXJjZXMvcmVwby1zb3VyY2UnO1xuaW1wb3J0IHsgSVBhY2thZ2VTb3VyY2VTZXR1cCB9IGZyb20gJy4uL2xpYi9wYWNrYWdlLXNvdXJjZXMvc291cmNlJztcbmltcG9ydCB7IHNlcmlhbGl6ZUZvclN1YnByb2Nlc3MgfSBmcm9tICcuLi9saWIvcGFja2FnZS1zb3VyY2VzL3N1YnByb2Nlc3MnO1xuXG5hc3luYyBmdW5jdGlvbiBtYWluKCkge1xuICBjb25zdCBhcmdzID0gYXdhaXQgeWFyZ3NcbiAgICAudXNhZ2UoJyQwIDxTVUlURU5BTUU+JylcbiAgICAucG9zaXRpb25hbCgnU1VJVEVOQU1FJywge1xuICAgICAgZGVzY3JpcHRvbjogJ05hbWUgb2YgdGhlIHRlc3Qgc3VpdGUgdG8gcnVuJyxcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZGVtYW5kT3B0aW9uOiB0cnVlLFxuICAgIH0pXG4gICAgLm9wdGlvbigndGVzdCcsIHtcbiAgICAgIGRlc2NyaXB0b246ICdUZXN0IHBhdHRlcm4gdG8gc2VsZWN0aXZlbHkgcnVuIHRlc3RzJyxcbiAgICAgIGFsaWFzOiAndCcsXG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIHJlcXVpcmVzQXJnOiB0cnVlLFxuICAgIH0pXG4gICAgLm9wdGlvbigndGVzdC1maWxlJywge1xuICAgICAgZGVzY3JpcHRpb246ICdUaGUgc3BlY2lmaWMgdGVzdCBmaWxlIHRvIHJ1bicsXG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIHJlcXVpcmVzQXJnOiB0cnVlLFxuICAgIH0pXG4gICAgLm9wdGlvbigndXNlLXNvdXJjZScsIHtcbiAgICAgIGRlc2NyaXB0b246ICdVc2UgVHlwZVNjcmlwdCBwYWNrYWdlcyBmcm9tIHRoZSBnaXZlbiBzb3VyY2UgcmVwb3NpdG9yeSAob3IgXCJhdXRvXCIpJyxcbiAgICAgIGFsaWFzOiAncycsXG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIHJlcXVpcmVzQXJnOiB0cnVlLFxuICAgIH0pXG4gICAgLm9wdGlvbigndXNlLWNsaS1yZWxlYXNlJywge1xuICAgICAgZGVzY3JpcHRvbjogJ1J1biB0aGUgY3VycmVudCB0ZXN0cyBhZ2FpbnN0IHRoZSBDTEkgYXQgdGhlIGdpdmVuIHZlcnNpb24nLFxuICAgICAgYWxpYXM6ICd1JyxcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgcmVxdWlyZXNBcmc6IHRydWUsXG4gICAgfSlcbiAgICAub3B0aW9uKCdhdXRvLXNvdXJjZScsIHtcbiAgICAgIGFsaWFzOiAnYScsXG4gICAgICBkZXNjcmlwdGlvbjogJ0F1dG9tYXRpY2FsbHkgZmluZCB0aGUgc291cmNlIHRyZWUgZnJvbSB0aGUgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeScsXG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICByZXF1aXJlc0FyZzogZmFsc2UsXG4gICAgfSlcbiAgICAub3B0aW9uKCdydW5JbkJhbmQnLCB7XG4gICAgICBkZXNjcmlwdG9uOiAnUnVuIGFsbCB0ZXN0cyBpbiBvbmUgTm9kZSBwcm9jZXNzJyxcbiAgICAgIGFsaWFzOiAnaScsXG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgfSlcbiAgICAub3B0aW9ucygnZnJhbWV3b3JrLXZlcnNpb24nLCB7XG4gICAgICBkZXNjcmlwdGlvbjogJ0ZyYW1ld29yayB2ZXJzaW9uIHRvIHVzZSwgaWYgZGlmZmVyZW50IHRoYW4gdGhlIENMSSB2ZXJzaW9uIChub3QgYWxsIHN1aXRlcyByZXNwZWN0IHRoaXMpJyxcbiAgICAgIGFsaWFzOiAnZicsXG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICB9KVxuICAgIC5vcHRpb25zKCd2ZXJib3NlJywge1xuICAgICAgYWxpYXM6ICd2JyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnUnVuIGluIHZlcmJvc2UgbW9kZScsXG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICByZXF1aXJlc0FyZzogZmFsc2UsXG4gICAgfSlcbiAgICAub3B0aW9ucygncGFzc1dpdGhOb1Rlc3RzJywge1xuICAgICAgZGVzY3JpcHRpb246ICdBbGxvdyBwYXNzaW5nIGlmIHRoZSB0ZXN0IHN1aXRlIGlzIG5vdCBmb3VuZCAoZGVmYXVsdCB0cnVlIHdoZW4gSVNfQ0FOQVJZIG1vZGUsIGZhbHNlIG90aGVyd2lzZSknLFxuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgcmVxdWlyZXNBcmc6IGZhbHNlLFxuICAgIH0pXG4gICAgLmhlbHAoKVxuICAgIC5zaG93SGVscE9uRmFpbChmYWxzZSlcbiAgICAuYXJndjtcblxuICBjb25zdCBzdWl0ZU5hbWUgPSBhcmdzLl9bMF0gYXMgc3RyaW5nO1xuICBpZiAoIXN1aXRlTmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcignVXNhZ2U6IHJ1bi1zdWl0ZSA8U1VJVEVOQU1FPicpO1xuICB9XG5cbiAgbGV0IHBhY2thZ2VTb3VyY2U6IHVuZGVmaW5lZCB8IElQYWNrYWdlU291cmNlU2V0dXA7XG4gIGZ1bmN0aW9uIHVzZVBhY2thZ2VTb3VyY2UoczogSVBhY2thZ2VTb3VyY2VTZXR1cCkge1xuICAgIGlmIChwYWNrYWdlU291cmNlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBzcGVjaWZ5IHR3byBwYWNrYWdlIHNvdXJjZXMnKTtcbiAgICB9XG4gICAgcGFja2FnZVNvdXJjZSA9IHM7XG4gIH1cblxuICBpZiAoYXJnc1sndXNlLXNvdXJjZSddIHx8IGFyZ3NbJ2F1dG8tc291cmNlJ10pIHtcbiAgICBpZiAoYXJnc1snZnJhbWV3b3JrLXZlcnNpb24nXSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgdXNlIC0tZnJhbWV3b3JrLXZlcnNpb24gd2l0aCAtLXVzZS1zb3VyY2UnKTtcbiAgICB9XG5cbiAgICBjb25zdCByb290ID0gYXJnc1sndXNlLXNvdXJjZSddICYmIGFyZ3NbJ3VzZS1zb3VyY2UnXSAhPT0gJ2F1dG8nXG4gICAgICA/IGFyZ3NbJ3VzZS1zb3VyY2UnXVxuICAgICAgOiBhd2FpdCBhdXRvRmluZFJvb3QoKTtcblxuICAgIHVzZVBhY2thZ2VTb3VyY2UobmV3IFJlcG9QYWNrYWdlU291cmNlU2V0dXAocm9vdCkpO1xuICB9IGVsc2UgaWYgKGFyZ3NbJ3VzZS1jbGktcmVsZWFzZSddKSB7XG4gICAgdXNlUGFja2FnZVNvdXJjZShuZXcgUmVsZWFzZVBhY2thZ2VTb3VyY2VTZXR1cChhcmdzWyd1c2UtY2xpLXJlbGVhc2UnXSwgYXJnc1snZnJhbWV3b3JrLXZlcnNpb24nXSkpO1xuICB9XG4gIGlmICghcGFja2FnZVNvdXJjZSkge1xuICAgIHRocm93IG5ldyBFcnJvcignU3BlY2lmeSBlaXRoZXIgLS11c2Utc291cmNlIG9yIC0tdXNlLWNsaS1yZWxlYXNlJyk7XG4gIH1cblxuICBjb25zb2xlLmxvZyhgUGFja2FnZSBzb3VyY2U6ICR7cGFja2FnZVNvdXJjZS5kZXNjcmlwdGlvbn1gKTtcbiAgY29uc29sZS5sb2coYFRlc3Qgc3VpdGU6ICAgICAke3N1aXRlTmFtZX1gKTtcblxuICBhd2FpdCBwYWNrYWdlU291cmNlLnByZXBhcmUoKTtcbiAgc2VyaWFsaXplRm9yU3VicHJvY2VzcyhwYWNrYWdlU291cmNlKTtcblxuICBpZiAoYXJncy52ZXJib3NlKSB7XG4gICAgcHJvY2Vzcy5lbnYuVkVSQk9TRSA9ICcxJztcbiAgfVxuXG4gIC8vIE1vdGl2YXRpb24gYmVoaW5kIHRoaXMgYmVoYXZpb3I6IHdoZW4gYWRkaW5nIGEgbmV3IHRlc3Qgc3VpdGUgdG8gdGhlIHBpcGVsaW5lLCBiZWNhdXNlIG9mIHRoZSB3YXkgb3VyXG4gIC8vIFBpcGVsaW5lIHBhY2thZ2Ugd29ya3MsIHRoZSBzdWl0ZSB3b3VsZCBiZSBhZGRlZCB0byB0aGUgcGlwZWxpbmUgQU5EIGFzIGEgY2FuYXJ5IGltbWVkaWF0ZWx5LiBUaGUgY2FuYXJ5XG4gIC8vIHdvdWxkIGZhaWwgdW50aWwgdGhlIHBhY2thZ2Ugd2FzIGFjdHVhbGx5IHJlbGVhc2VkLCBzbyBmb3IgY2FuYXJpZXMgd2UgbWFrZSBhbiBleGNlcHRpb24gc28gdGhhdCB0aGUgaW5pdGlhbFxuICAvLyBjYW5hcnkgd291bGQgc3VjY2VlZCBldmVuIGlmIHRoZSBzdWl0ZSB3YXNuJ3QgeWV0IGF2YWlsYWJsZS4gVGhlIGZhY3QgdGhhdCB0aGUgc3VpdGUgaXMgbm90IG9wdGlvbmFsIGluXG4gIC8vIHRoZSBwaXBlbGluZSBwcm90ZWN0cyB1cyBmcm9tIHR5cG9zLlxuICBjb25zdCBwYXNzV2l0aE5vVGVzdHMgPSBhcmdzLnBhc3NXaXRoTm9UZXN0cyA/PyAhIXByb2Nlc3MuZW52LklTX0NBTkFSWTtcblxuICAvLyBDb21tdW5pY2F0ZSB3aXRoIHRoZSBjb25maWcgZmlsZSAoaW50ZWcuamVzdC5jb25maWcuanMpXG4gIHByb2Nlc3MuZW52LlRFU1RfU1VJVEVfTkFNRSA9IHN1aXRlTmFtZTtcblxuICB0cnkge1xuICAgIGF3YWl0IGplc3QucnVuKFtcbiAgICAgIC4uLmFyZ3MucnVuSW5CYW5kID8gWyctaSddIDogW10sXG4gICAgICAuLi5hcmdzLnRlc3QgPyBbJy10JywgYXJncy50ZXN0XSA6IFtdLFxuICAgICAgLi4uYXJncy52ZXJib3NlID8gWyctLXZlcmJvc2UnXSA6IFtdLFxuICAgICAgLi4ucGFzc1dpdGhOb1Rlc3RzID8gWyctLXBhc3NXaXRoTm9UZXN0cyddIDogW10sXG4gICAgICAuLi5hcmdzWyd0ZXN0LWZpbGUnXSA/IFthcmdzWyd0ZXN0LWZpbGUnXV0gOiBbXSxcbiAgICBdLCBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4nLCAncmVzb3VyY2VzJywgJ2ludGVnLmplc3QuY29uZmlnLmpzJykpO1xuXG4gIH0gZmluYWxseSB7XG4gICAgYXdhaXQgcGFja2FnZVNvdXJjZS5jbGVhbnVwKCk7XG4gIH1cbn1cblxubWFpbigpLmNhdGNoKGUgPT4ge1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICBjb25zb2xlLmVycm9yKGUpO1xuICBwcm9jZXNzLmV4aXRDb2RlID0gMTtcbn0pO1xuIl19