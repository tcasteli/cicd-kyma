build-srv:
	podman build --platform linux/amd64 -t tcastelia/hanaacademyrepo:app1-srv -f srv/Dockerfile .
build-app:
	podman build --platform linux/amd64 -t tcastelia/hanaacademyrepo:app1-app -f app/Dockerfile .

docker-push: build-srv build-app
	podman push tcastelia/hanaacademyrepo:app1-srv
	podman push tcastelia/hanaacademyrepo:app1-app

helm-deploy:
	helm upgrade -n dev -i app1-srv helm/app1-srv --install
	helm upgrade -n dev -i app1-app helm/app1-app --install

helm-undeploy:
	helm uninstall -n dev app1-app
	helm uninstall -n dev app1-srv
