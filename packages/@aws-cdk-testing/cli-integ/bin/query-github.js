"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yargs = require("yargs");
const github_1 = require("../lib/github");
async function main() {
    var _a;
    const args = await yargs
        .option('token', {
        descripton: 'GitHub token (default: from environment GITHUB_TOKEN)',
        alias: 't',
        type: 'string',
        requiresArg: true,
    })
        .command('last-release', 'Query the last release', cmd => cmd
        .option('prior-to', {
        description: 'Return the most recent release before the given version',
        alias: 'p',
        type: 'string',
        requiresArg: true,
    })
        .option('major', {
        description: 'Return the most recent release that matches',
        alias: 'm',
        type: 'string',
        requiresArg: true,
    }))
        .demandCommand()
        .help()
        .showHelpOnFail(false)
        .argv;
    const command = args._[0];
    const token = (_a = args.token) !== null && _a !== void 0 ? _a : process.env.GITHUB_TOKEN;
    if (!token) {
        throw new Error('Either pass --token or set GITHUB_TOKEN.');
    }
    switch (command) {
        case 'last-release':
            if (args['prior-to'] && args.major) {
                throw new Error('Cannot pass both `--prior-to and --major at the same time');
            }
            // eslint-disable-next-line no-console
            console.log(await (0, github_1.fetchPreviousVersion)(token, {
                priorTo: args['prior-to'],
                majorVersion: args.major,
            }));
            break;
    }
}
main().catch(e => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exitCode = 1;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVlcnktZ2l0aHViLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicXVlcnktZ2l0aHViLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsK0JBQStCO0FBQy9CLDBDQUFxRDtBQUVyRCxLQUFLLFVBQVUsSUFBSTs7SUFDakIsTUFBTSxJQUFJLEdBQUcsTUFBTSxLQUFLO1NBQ3JCLE1BQU0sQ0FBQyxPQUFPLEVBQUU7UUFDZixVQUFVLEVBQUUsdURBQXVEO1FBQ25FLEtBQUssRUFBRSxHQUFHO1FBQ1YsSUFBSSxFQUFFLFFBQVE7UUFDZCxXQUFXLEVBQUUsSUFBSTtLQUNsQixDQUFDO1NBQ0QsT0FBTyxDQUFDLGNBQWMsRUFBRSx3QkFBd0IsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUc7U0FDMUQsTUFBTSxDQUFDLFVBQVUsRUFBRTtRQUNsQixXQUFXLEVBQUUseURBQXlEO1FBQ3RFLEtBQUssRUFBRSxHQUFHO1FBQ1YsSUFBSSxFQUFFLFFBQVE7UUFDZCxXQUFXLEVBQUUsSUFBSTtLQUNsQixDQUFDO1NBQ0QsTUFBTSxDQUFDLE9BQU8sRUFBRTtRQUNmLFdBQVcsRUFBRSw2Q0FBNkM7UUFDMUQsS0FBSyxFQUFFLEdBQUc7UUFDVixJQUFJLEVBQUUsUUFBUTtRQUNkLFdBQVcsRUFBRSxJQUFJO0tBQ2xCLENBQUMsQ0FBQztTQUNKLGFBQWEsRUFBRTtTQUNmLElBQUksRUFBRTtTQUNOLGNBQWMsQ0FBQyxLQUFLLENBQUM7U0FDckIsSUFBSSxDQUFDO0lBRVIsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUUxQixNQUFNLEtBQUssR0FBRyxNQUFBLElBQUksQ0FBQyxLQUFLLG1DQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDO0lBQ3JELElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNYLE1BQU0sSUFBSSxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQztJQUM5RCxDQUFDO0lBRUQsUUFBUSxPQUFPLEVBQUUsQ0FBQztRQUNoQixLQUFLLGNBQWM7WUFDakIsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUNuQyxNQUFNLElBQUksS0FBSyxDQUFDLDJEQUEyRCxDQUFDLENBQUM7WUFDL0UsQ0FBQztZQUVELHNDQUFzQztZQUN0QyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sSUFBQSw2QkFBb0IsRUFBQyxLQUFLLEVBQUU7Z0JBQzVDLE9BQU8sRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDO2dCQUN6QixZQUFZLEVBQUUsSUFBSSxDQUFDLEtBQUs7YUFDekIsQ0FBQyxDQUFDLENBQUM7WUFDSixNQUFNO0lBQ1YsQ0FBQztBQUNILENBQUM7QUFFRCxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUU7SUFDZixzQ0FBc0M7SUFDdEMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNqQixPQUFPLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztBQUN2QixDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIHlhcmdzIGZyb20gJ3lhcmdzJztcbmltcG9ydCB7IGZldGNoUHJldmlvdXNWZXJzaW9uIH0gZnJvbSAnLi4vbGliL2dpdGh1Yic7XG5cbmFzeW5jIGZ1bmN0aW9uIG1haW4oKSB7XG4gIGNvbnN0IGFyZ3MgPSBhd2FpdCB5YXJnc1xuICAgIC5vcHRpb24oJ3Rva2VuJywge1xuICAgICAgZGVzY3JpcHRvbjogJ0dpdEh1YiB0b2tlbiAoZGVmYXVsdDogZnJvbSBlbnZpcm9ubWVudCBHSVRIVUJfVE9LRU4pJyxcbiAgICAgIGFsaWFzOiAndCcsXG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIHJlcXVpcmVzQXJnOiB0cnVlLFxuICAgIH0pXG4gICAgLmNvbW1hbmQoJ2xhc3QtcmVsZWFzZScsICdRdWVyeSB0aGUgbGFzdCByZWxlYXNlJywgY21kID0+IGNtZFxuICAgICAgLm9wdGlvbigncHJpb3ItdG8nLCB7XG4gICAgICAgIGRlc2NyaXB0aW9uOiAnUmV0dXJuIHRoZSBtb3N0IHJlY2VudCByZWxlYXNlIGJlZm9yZSB0aGUgZ2l2ZW4gdmVyc2lvbicsXG4gICAgICAgIGFsaWFzOiAncCcsXG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICByZXF1aXJlc0FyZzogdHJ1ZSxcbiAgICAgIH0pXG4gICAgICAub3B0aW9uKCdtYWpvcicsIHtcbiAgICAgICAgZGVzY3JpcHRpb246ICdSZXR1cm4gdGhlIG1vc3QgcmVjZW50IHJlbGVhc2UgdGhhdCBtYXRjaGVzJyxcbiAgICAgICAgYWxpYXM6ICdtJyxcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIHJlcXVpcmVzQXJnOiB0cnVlLFxuICAgICAgfSkpXG4gICAgLmRlbWFuZENvbW1hbmQoKVxuICAgIC5oZWxwKClcbiAgICAuc2hvd0hlbHBPbkZhaWwoZmFsc2UpXG4gICAgLmFyZ3Y7XG5cbiAgY29uc3QgY29tbWFuZCA9IGFyZ3MuX1swXTtcblxuICBjb25zdCB0b2tlbiA9IGFyZ3MudG9rZW4gPz8gcHJvY2Vzcy5lbnYuR0lUSFVCX1RPS0VOO1xuICBpZiAoIXRva2VuKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdFaXRoZXIgcGFzcyAtLXRva2VuIG9yIHNldCBHSVRIVUJfVE9LRU4uJyk7XG4gIH1cblxuICBzd2l0Y2ggKGNvbW1hbmQpIHtcbiAgICBjYXNlICdsYXN0LXJlbGVhc2UnOlxuICAgICAgaWYgKGFyZ3NbJ3ByaW9yLXRvJ10gJiYgYXJncy5tYWpvcikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBwYXNzIGJvdGggYC0tcHJpb3ItdG8gYW5kIC0tbWFqb3IgYXQgdGhlIHNhbWUgdGltZScpO1xuICAgICAgfVxuXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgY29uc29sZS5sb2coYXdhaXQgZmV0Y2hQcmV2aW91c1ZlcnNpb24odG9rZW4sIHtcbiAgICAgICAgcHJpb3JUbzogYXJnc1sncHJpb3ItdG8nXSxcbiAgICAgICAgbWFqb3JWZXJzaW9uOiBhcmdzLm1ham9yLFxuICAgICAgfSkpO1xuICAgICAgYnJlYWs7XG4gIH1cbn1cblxubWFpbigpLmNhdGNoKGUgPT4ge1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICBjb25zb2xlLmVycm9yKGUpO1xuICBwcm9jZXNzLmV4aXRDb2RlID0gMTtcbn0pO1xuIl19