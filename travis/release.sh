git push origin-for-travis deploy

git pull origin-for-travis master
git checkout master
git merge deploy
git push origin-for-travis master
