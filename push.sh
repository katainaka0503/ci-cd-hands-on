set -x

$(aws ecr get-login --no-include-email --region ap-northeast-1) && \
  docker build -t ci-cd-hands-on . && \
  docker tag ci-cd-hands-on:latest 738965884675.dkr.ecr.ap-northeast-1.amazonaws.com/ci-cd-hands-on:node && \
  docker push 738965884675.dkr.ecr.ap-northeast-1.amazonaws.com/ci-cd-hands-on:node
