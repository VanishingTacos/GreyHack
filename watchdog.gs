comp = get_shell.host_computer
root_folder = comp.File("/")
get_config = comp.File(home_dir+"/.WatchDogcfg")
if not get_config then comp.create_folder(home_dir,".WatchDogcfg")
config_file = comp.File(home_dir+"/.WatchDogcfg/WatchDog.cfg")
if not config_file then 
	comp.touch(home_dir+"/.WatchDogcfg","WatchDog.cfg")
	get_shell.launch(program_path)
end if
config_content = comp.File(home_dir+"/.WatchDogcfg/WatchDog.cfg").get_content

/////////// First Initialisation /////////// 
if config_content.len == 0 then
	user_input("<b>Please press enter to start WatchDog file indexing...</b>\nThis will store all file paths and their sizes to ~/.WatchDogcfg/WatchDog.cfg.")
	for file in root_folder.get_files
		print(file.path + " " + size(file))
		config_file.set_content(config_file.get_content + "\n" + file.path + " " + size(file))
	end for
	for folder_root in root_folder.get_folders
		for file in folder_root.get_files
			print(file.path + " " + size(file))
			config_file.set_content(config_file.get_content + "\n" + file.path + " " + size(file))
		end for
		for folder in folder_root.get_folders
			for file in folder.get_files
				print(file.path + " " + size(file))
				config_file.set_content(config_file.get_content + "\n" + file.path + " " + size(file))
			end for
		end for
	end for
end if
clear_screen
print("  _    _       _       _    ______            ")
print("| |  | |     | |     | |   |  _  \           ")
print("| |  | | __ _| |_ ___| |__ | | | |___   __ _ ")
print("| |/\| |/ _` | __/ __| '_ \| | | / _ \ / _` |")
print("\  /\  / (_| | || (__| | | | |/ / (_) | (_| |")
print(" \/  \/ \__,_|\__\___|_| |_|___/ \___/ \__, |")
print("                                        __/ |")
print("                                       |___/ ")
user_input("Prss enter to start...")
clear_screen

while true
	
	/////////// Processes Monitoring /////////// 
	get_procs_init = get_shell.host_computer.show_procs.split("\n")
	procs_info_init = []
	procs_names_init = []
	for i in get_procs_init
		if i == get_procs_init[0] then continue
		procs_info_init = procs_info_init.push(i.split(" "))
	end for
	for i in procs_info_init
		procs_names_init = procs_names_init.push(i[4])
	end for
	wait(.1)
	get_procs = get_shell.host_computer.show_procs.split("\n")
	procs_info = []
	procs_names = []
	for i in get_procs
		if i == get_procs[0] then continue
		procs_info = procs_info.push(i.split(" "))
	end for
	for i in procs_info
		procs_names = procs_names.push(i[4])
	end for
	if procs_names != procs_names_init then
		if procs_names.len > procs_names_init.len then
			print("<b><color=white>[+] "+procs_names[procs_names.len-1]+"</color></b>")
		else if procs_names.len < procs_names_init.len then
			get_procs_map = {}
			get_procs_init_map = {}
			for line in get_procs[1:]
				name = line.split(" ")[4]
				if get_procs_map.hasIndex(name) then get_procs_map[name] = get_procs_map[name] + 1 else get_procs_map[name] = 1
				get_procs_init_map[name] = 0 //Set a value in get_procs_init_map here in case we open a program that does not appear in get_procs_init
			end for
			for line in get_procs_init[1:]
				name = line.split(" ")[4]
				if get_procs_init_map.hasIndex(name) then get_procs_init_map[name] = get_procs_init_map[name] + 1 else get_procs_init_map[name] = 1 //We still need to check if name exists in case we have a program that appears in get_procs_init but not in get_procs
				if not get_procs_map.hasIndex(name) then get_procs_map[name] = 0 //Set a value in get_procs_map here if it isnt set
			end for
			for name in get_procs_map.indexes
				if get_procs_map[name] - get_procs_init_map[name] < 0 then
					print("<b><color=red>[-] "+name+"</color></b>")
				end if
			end for
		end if
	end if
	
	/////////// File Change Monitoring ///////////
	files = comp.File(home_dir+"/.WatchDogcfg/WatchDog.cfg").get_content.split("\n")
	for file in files[1:]
		path = file.split(" ")[0]
		if path == home_dir+"/.WatchDogcfg/WatchDog.cfg" then continue
		get_file = comp.File(path)
		if size(get_file) != file.split(" ")[1] then
			if size(get_file) > file.split(" ")[1] then
				diff = size(get_file).to_int - file.split(" ")[1].to_int
				print("<b><color=red>[!] "+path + " size has increased by " + diff + " bytes</color></b>")
				config_file.set_content(config_content.replace(path + " " + file.split(" ")[1], path + " " + size(get_file)))
			else if size(get_file) < file.split(" ")[1] then
				diff = size(get_file).to_int - file.split(" ")[1].to_int
				print("<b><color=red>[!]" +path + " size has decreased by " + diff + " bytes</color></b>")
				config_file.set_content(config_content.replace(path + " " + file.split(" ")[1], path + " " + size(get_file)))
			end if
		end if
	end for
	
	/////////// New File Detection ///////////
	for file in root_folder.get_files
		if config_file.get_content.indexOf(file.path + " " + size(file)) == null then
			config_file.set_content(config_file.get_content + "\n" + file.path + " " + size(file))
			print("<b><color=red>[+] New file was detected: " + file.path + "</color></b>")
		end if
	end for
	for folder_root in root_folder.get_folders
		for file in folder_root.get_files
			if config_file.get_content.indexOf(file.path + " " + size(file)) == null then
				config_file.set_content(config_file.get_content + "\n" + file.path + " " + size(file))
				print("<b><color=red>[+] New file was detected: " + file.path + "</color></b>")
			end if
		end for
		for folder in folder_root.get_folders
			for file in folder.get_files
				if config_file.get_content.indexOf(file.path + " " + size(file)) == null then
					config_file.set_content(config_file.get_content + "\n" + file.path + " " + size(file))
					print("<b><color=red>[+] New file was detected: " + file.path + "</color></b>")
				end if
			end for
		end for
	end for
end while