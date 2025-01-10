import { existsSync } from 'fs';
import * as path from 'path';
import {
  integTest,
  randomInteger,
  withSamIntegrationFixture,
} from '../../lib';

jest.setTimeout(2 * 60 * 60_000); // Includes the time to acquire locks, worst-case single-threaded runtime

integTest(
    'CDK synth add the metadata properties expected by sam',
    withSamIntegrationFixture(async (fixture) => {
        // Synth first
        await fixture.cdkSynth();

        const template = fixture.template('TestStack');

        const expectedResources = [
            {
                // Python Layer Version
                id: 'PythonLayerVersion39495CEF',
                cdkId: 'PythonLayerVersion',
                isBundled: true,
                property: 'Content',
            },
            {
                // Layer Version
                id: 'LayerVersion3878DA3A',
                cdkId: 'LayerVersion',
                isBundled: false,
                property: 'Content',
            },
            {
                // Bundled layer version
                id: 'BundledLayerVersionPythonRuntime6BADBD6E',
                cdkId: 'BundledLayerVersionPythonRuntime',
                isBundled: true,
                property: 'Content',
            },
            {
                // Python Function
                id: 'PythonFunction0BCF77FD',
                cdkId: 'PythonFunction',
                isBundled: true,
                property: 'Code',
            },
            {
                // Log Retention Function
                id: 'LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8aFD4BFC8A',
                cdkId: 'LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8a',
                isBundled: false,
                property: 'Code',
            },
            {
                // Function
                id: 'FunctionPythonRuntime28CBDA05',
                cdkId: 'FunctionPythonRuntime',
                isBundled: false,
                property: 'Code',
            },
            {
                // Bundled Function
                id: 'BundledFunctionPythonRuntime4D9A0918',
                cdkId: 'BundledFunctionPythonRuntime',
                isBundled: true,
                property: 'Code',
            },
            {
                // NodeJs Function
                id: 'NodejsFunction09C1F20F',
                cdkId: 'NodejsFunction',
                isBundled: true,
                property: 'Code',
            },
            {
                // Go Function
                id: 'GoFunctionCA95FBAA',
                cdkId: 'GoFunction',
                isBundled: true,
                property: 'Code',
            },
            {
                // Docker Image Function
                id: 'DockerImageFunction28B773E6',
                cdkId: 'DockerImageFunction',
                dockerFilePath: 'Dockerfile',
                property: 'Code.ImageUri',
            },
            {
                // Spec Rest Api
                id: 'SpecRestAPI7D4B3A34',
                cdkId: 'SpecRestAPI',
                property: 'BodyS3Location',
            },
        ];

        for (const resource of expectedResources) {
            fixture.output.write(`validate assets metadata for resource ${JSON.stringify(resource)} \n`);
            expect(resource.id in template.Resources).toBeTruthy();
            expect(template.Resources[resource.id]).toEqual(
                expect.objectContaining({
                    Metadata: {
                        'aws:cdk:path': `${fixture.fullStackName('TestStack')}/${resource.cdkId}/Resource`,
                        'aws:asset:path': expect.stringMatching(/asset\.[0-9a-zA-Z]{64}/),
                        'aws:asset:is-bundled': resource.isBundled,
                        'aws:asset:dockerfile-path': resource.dockerFilePath,
                        'aws:asset:property': resource.property,
                    },
                }),
            );
        }

        // Nested Stack
        fixture.output.write('validate assets metadata for nested stack resource \n');
        expect('NestedStackNestedStackNestedStackNestedStackResourceB70834FD' in template.Resources).toBeTruthy();
        expect(template.Resources.NestedStackNestedStackNestedStackNestedStackResourceB70834FD).toEqual(
            expect.objectContaining({
                Metadata: {
                    'aws:cdk:path': `${fixture.fullStackName(
                        'TestStack',
                    )}/NestedStack.NestedStack/NestedStack.NestedStackResource`,
                    'aws:asset:path': expect.stringMatching(
                        `${fixture.stackNamePrefix.replace(/-/, '')}TestStackNestedStack[0-9A-Z]{8}\.nested\.template\.json`,
                    ),
                    'aws:asset:property': 'TemplateURL',
                },
            }),
        );
    }),
);

integTest(
    'CDK synth bundled functions as expected',
    withSamIntegrationFixture(async (fixture) => {
        // Synth first
        await fixture.cdkSynth();

        const template = fixture.template('TestStack');

        const expectedBundledAssets = [
            {
                // Python Layer Version
                id: 'PythonLayerVersion39495CEF',
                files: [
                    'python/layer_version_dependency.py',
                    'python/geonamescache/__init__.py',
                    'python/geonamescache-1.3.0.dist-info',
                ],
            },
            {
                // Layer Version
                id: 'LayerVersion3878DA3A',
                files: ['layer_version_dependency.py', 'requirements.txt'],
            },
            {
                // Bundled layer version
                id: 'BundledLayerVersionPythonRuntime6BADBD6E',
                files: [
                    'python/layer_version_dependency.py',
                    'python/geonamescache/__init__.py',
                    'python/geonamescache-1.3.0.dist-info',
                ],
            },
            {
                // Python Function
                id: 'PythonFunction0BCF77FD',
                files: ['app.py', 'geonamescache/__init__.py', 'geonamescache-1.3.0.dist-info'],
            },
            {
                // Function
                id: 'FunctionPythonRuntime28CBDA05',
                files: ['app.py', 'requirements.txt'],
            },
            {
                // Bundled Function
                id: 'BundledFunctionPythonRuntime4D9A0918',
                files: ['app.py', 'geonamescache/__init__.py', 'geonamescache-1.3.0.dist-info'],
            },
            {
                // NodeJs Function
                id: 'NodejsFunction09C1F20F',
                files: ['index.js'],
            },
            {
                // Go Function
                id: 'GoFunctionCA95FBAA',
                files: ['bootstrap'],
            },
            {
                // Docker Image Function
                id: 'DockerImageFunction28B773E6',
                files: ['app.js', 'Dockerfile', 'package.json'],
            },
        ];

        for (const resource of expectedBundledAssets) {
            const assetPath = template.Resources[resource.id].Metadata['aws:asset:path'];
            for (const file of resource.files) {
                fixture.output.write(`validate Path ${file} for resource ${resource}`);
                expect(existsSync(path.join(fixture.integTestDir, 'cdk.out', assetPath, file))).toBeTruthy();
            }
        }
    }),
);

integTest(
    'sam can locally test the synthesized cdk application',
    withSamIntegrationFixture(async (fixture) => {
        // Synth first
        await fixture.cdkSynth();

        const result = await fixture.samLocalStartApi(
            'TestStack',
            false,
            randomInteger(30000, 40000),
            '/restapis/spec/pythonFunction',
        );
        expect(result.actionSucceeded).toBeTruthy();
        expect(result.actionOutput).toEqual(
            expect.objectContaining({
                message: 'Hello World',
            }),
        );
    }),
);