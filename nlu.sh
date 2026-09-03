cd nlu-engine
source venv/bin/activate
sleep 2
rasa train

source venv/bin/activate
kill -9 $(lsof -ti :5005)
rasa run --enable-api --cors "*"

kill -9 $(lsof -ti :5055)
rasa run actions

kill -9 $(lsof -ti :5006)
python auth_server.py


# 1. Train mô hình bằng file 80%
rasa train nlu --nlu train_test_split/training_data.yml

# 2. Đem mô hình đi thi cử bằng file test 20%
rasa test nlu --nlu train_test_split/test_data.yml --success-on-failures

