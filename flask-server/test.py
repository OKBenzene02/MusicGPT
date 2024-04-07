import requests

# Assuming you have a separate upload endpoint (not shown)
upload_response = requests.post('http://127.0.0.1:3000/upload', files={'file': open('2112_jb38_1_5.mid', 'rb')})
print(upload_response.json())

# Check the upload response for success and retrieve the temporary path if successful
if upload_response.status_code == 200:
    temp_path = upload_response.json().get('temp_path')
    print(temp_path)
    
    # Send a POST request to the generate endpoint with the temp_path in JSON
    generate_response = requests.post('http://127.0.0.1:3000/generate', json={'temp_path': temp_path, 'file_name': 'new_file_7'})
    print('Generating the composition.........' if generate_response else "error generating")
    # Process the generate response
else:
    print("Error uploading file")

print(requests.get('http://127.0.0.1:3000/audio').json())
print(requests.get('http://127.0.0.1:3000/audio_files/new_file_1.mp3'))