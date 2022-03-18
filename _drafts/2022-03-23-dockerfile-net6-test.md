---
published: true
ID: 202203031
title: 'Dockerfile para .Net 6'
author: fernandoescolar
post_date: 2022-03-23 06:15:41
layout: post
tags: docker k8s net6 test
background: '/assets/uploads/bg/docker.jpg'
---

A ver si conseguimos hacer un artículo sobre contenedores sin usar la palabra *docker* españolizada y como si fuera un verbo. Y a ver si también conseguimos hablar de como *dockerizar* nuestra aplicaciones en .Net6... oh vaya... bueno, como iba diciendo: a ver si conseguimos no escribir la palabra *kubernetes* en todo el artículo. Difícil reto<!--break-->.

Imaginemos que tenemos una solución en **.Net 6** llamada "DockerWithNet6":

```bash
mkdir demo
cd demo
dotnet new sln -n DockerWithNet6
bash
```

Imaginemos que dentro de esta solución tenemos una aplicación de tipo `webapi` llamada "MyApi":

```bash
dotnet new webapi -o MyApi
dotnet sln add MyApi/MyApi.csproj
```

Y que tenemos un proyecto para los tests unitarios llamado "MyApi.Tests":

```bash
dotnet new xunit -o MyApi.Tests
dotnet sln add MyApi.Tests/MyApi.Tests.csproj
dotnet add MyApi.Tests/MyApi.Tests.csproj reference MyApi/MyApi.csproj
```

```bash
dotnet add MyApi.Tests/MyApi.Tests.csproj package coverlet.msbuild
```

```bash
dotnet test -c Release --results-directory testresults --logger "trx" -p:CollectCoverage=true -p:CoverletOutput="../testresults/" -p:MergeWith="../testresults/coverage.json" -p:CoverletOutputFormat=json%2cCobertura -m:1
```

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src
COPY ./DockerWithNet6.sln ./DockerWithNet6.sln
COPY ./MyApi/MyApi.csproj ./MyApi/MyApi.csproj
COPY ./MyApi.Tests/MyApi.Tests.csproj ./MyApi.Tests/MyApi.Tests.csproj
RUN dotnet restore

COPY . .
RUN dotnet build "MyApi/MyApi.csproj" -c Release -o /app

FROM build as tests
LABEL test=true
RUN dotnet test -c Release --results-directory /testresults --logger "trx" -p:CollectCoverage=true -p:CoverletOutput="/testresults/" -p:MergeWith="/testresults/coverage.json" -p:CoverletOutputFormat=json%2cCobertura -m:1

FROM build AS publish
RUN dotnet publish "MyApi/MyApi.csproj" -c Release -o /app

FROM base AS final
WORKDIR /app
COPY --from=publish /app .
ENTRYPOINT ["dotnet", "MyApi.dll"]
```

```bash
docker build -t docker-net6-test .
```

```bash
docker run -p 5000:80 docker-net6-test
```

```bash
$ curl http://localhost:5000/WeatherForecast
[{"date":"2022-03-15T09:06:08.9415323+00:00","temperatureC":33,"temperatureF":91,"summary":"Scorching"},{"date":"2022-03-16T09:06:08.942493+00:00","temperatureC":0,"temperatureF":32,"summary":"Cool"},{"date":"2022-03-17T09:06:08.9424966+00:00","temperatureC":-4,"temperatureF":25,"summary":"Balmy"},{"date":"2022-03-18T09:06:08.9424973+00:00","temperatureC":34,"temperatureF":93,"summary":"Hot"},{"date":"2022-03-19T09:06:08.9424979+00:00","temperatureC":32,"temperatureF":89,"summary":"Bracing"}]
```

```bash
$ docker images --filter "label=test=true"
REPOSITORY          TAG       IMAGE ID       CREATED              SIZE
<none>              <none>    8c68eaf6eabd   About a minute ago   1.05GB
<none>              <none>    0201ede4470f   3 minutes ago        1.05GB
<none>              <none>    605452f092e7   5 minutes ago        1.05GB
<none>              <none>    8f38409a1f02   10 minutes ago       1.05GB
...
```

```bash
image_with_tests=$(docker images --filter "label=test=true" | head -2 | tail -1 |  sed 's/|/ /' | awk '{print $3}')
docker create --name test-results $image_with_tests
```

```bash
docker cp test-results:/testresults ./testresults
```

```bash
docker build -t docker-net6-test . --target tests
```

```bash
docker create --name test-results docker-net6-test
```

```bash
docker cp test-results:/testresults ./testresults
```

```yaml
- script: |
    docker build -t docker-net6-test .
  displayName: build image
- script: |
    image_with_tests=$(docker images --filter "label=test=true" | head -2 | tail -1 |  sed 's/|/ /' | awk '{print $3}')
    docker create --name test-results $image_with_tests
    docker cp test-results:/testresults ./testresults
  displayName: copy results
- task: PublishTestResults@2
  inputs:
    testResultsFormat: 'VSTest'
    testResultsFiles: '**/*.trx'
    searchFolder: testresults/
    publishRunAttachments: true
  displayName: 'Publish test results'
- task: PublishCodeCoverageResults@1
  inputs:
    codeCoverageTool: 'cobertura'
    summaryFileLocation: 'testresults/coverage.cobertura.xml'
  displayName: 'Publish coverage reports'
- script: |
    docker rm test-results
  displayName: cleanup
```

![Azure DevOps: Pipeline - Test Coverage](/assets/uploads/2022/03/pipeline-test-coverage.png)

Si no ves el tab de covertura de código es porque hasta que no aparece hasta que no finaliza la pipeline completa

```bash
dotnet new xunit -o MyApi.Tests2
dotnet sln add MyApi.Tests2/MyApi.Tests2.csproj
dotnet add MyApi.Tests2/MyApi.Tests2.csproj reference MyApi/MyApi.csproj
dotnet add MyApi.Tests2/MyApi.Tests2.csproj package coverlet.msbuild
```

```bash
dotnet test -c Release --results-directory testresults --logger "trx" -p:CollectCoverage=true -p:CoverletOutput="../testresults/" -p:MergeWith="../testresults/coverage.json" -p:CoverletOutputFormat=json%2cCobertura -m:1
```

```dockerfile
COPY ./MyApi.Tests2/MyApi.Tests2.csproj ./MyApi.Tests2/MyApi.Tests2.csproj
```