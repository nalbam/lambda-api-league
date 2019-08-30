#!/bin/bash

CMD=${1:-$CIRCLE_JOB}

CIRCLE_BUILD_NUM=${CIRCLE_BUILD_NUM}

_build() {
    rm -rf target
    mkdir -p target

    cp ./*.tf ./target/

    pushd src

    npm run build
    zip -r ../target/lambda.zip *

    popd
}

_test() {
    terraform init
    terraform plan -var "build_no=$CIRCLE_BUILD_NUM"
}

_deploy() {
    terraform init
    terraform apply -var "build_no=$CIRCLE_BUILD_NUM" -auto-approve
}

case ${CMD} in
    build)
        _build
        ;;
    test)
        _test
        ;;
    deploy)
        _deploy
        ;;
esac
