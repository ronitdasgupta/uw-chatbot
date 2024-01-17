import openai
import os
import csv
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()


app = Flask(__name__)
CORS(app)

# Set up OpenAI API
openai.api_key = os.getenv("OPENAI_API_KEY")


class DataSet:
    def __init__(self, course, instructor, instructor_rating, instructor_review, average_gpa):
        self.course = course
        self.instructor = instructor
        self.instructor_rating = instructor_rating
        self.instructor_review = instructor_review
        self.average_gpa = average_gpa


# Read the CSV file and create a dictionary
data_dict = {}

with open('Chatbot-Dataset-UW-ClassInfo.csv', newline='', encoding='utf-8') as csvfile:
    csvreader = csv.DictReader(csvfile)
    for i, row in enumerate(csvreader, start=1):
        data = DataSet(
            row.get('\ufeffCourse', ''),
            row.get('Instructor', ''),
            row.get('Instructor Rating', ''),
            row.get('Instructor Review', ''),
            row.get('Average GPA', '')
        )
        data_dict[i] = data

# Create a system message that includes all the data from data_dict
system_message = "You are a helpful assistant. You will only answer questions/prompts relating to the University of Washington. If the user provides an input that is not related to the University of Washington you should say the following: Sorry, I am trained to only answer inputs relating to the University of Washington."

for key, value in data_dict.items():
    system_message += "\n\nCourse: {}\nInstructor: {}\nInstructor Rating: {}\nInstructor Review: {}\nAverage GPA: {}".format(
        value.course, value.instructor, value.instructor_rating, value.instructor_review, value.average_gpa
    )

print(system_message)


@app.route("/members")
def members():
    return {"members": ["Member1", "Member2", "Member3"]}


@app.route("/ask", methods=["POST"])
def ask():
    combined_chat = request.json.get('combinedChat')

    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system",
             "content": system_message},
            {"role": "user", "content": combined_chat}
        ]
    )

    answer = response.choices[0].message['content'].strip()

    return jsonify({"answer": answer})


if __name__ == "__main__":
    app.run(debug=True)
