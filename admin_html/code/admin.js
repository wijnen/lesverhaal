var groups, table, single;
var server_obj, server;

var ids = ['login', 'groups', 'tablediv', 'single'];

function show(which) {
	for (var i = 0; i < ids.length; ++i)
		document.getElementById(ids[i]).style.display = (ids[i] == which ? 'block' : 'none');
}

function init() {
	groups = document.getElementById('groups');
	table = document.getElementById('table');
	single = document.getElementById('single');
	show(null);
	server_obj = Rpc(Connection);
	server = server_obj.proxy;
}
window.AddEvent('load', init);

var Connection = {
	replaced: function() {
		alert('De verbinding is overgenomen door een nieuwe login');
		init();
	},
	login: function() {
		// Show the login screen.
		show('login');
	},
	group_list: function(list) {
		// Show the list of groups, with the available sections for each group.
		show('groups');
		groups.ClearAll();
		for (var g = 0; g < list.length; ++g) {
			var group = list[g];
			var div = groups.AddElement('div');
			div.AddElement('b').AddText(group[0] + ': ');
			for (var s = 1; s < group.length; ++s) {
				var a = div.AddElement('a').AddText(group[s][0] + ' (' + group[s][1] + ')').AddEvent('click', function() {
					server.show_section(this.group, this.section);
				});
				a.group = group[0];
				a.section = group[s][0];
			}
		}
	},
	students_list: function(group, questions, students) {
		// Show students with questions in a table.
		show('tablediv');
		table.ClearAll();
		var tr = table.AddElement('tr');
		tr.AddElement('th').AddText(group);
		for (var q = 0; q < questions.length; ++q)
			tr.AddElement('th').AddText(questions[q][1]).title = questions[q][2];
		var parse = function(ans) {
			return ans.length == 2 ? String(ans[0]).replace('.', ',') + ' ' + ans[1] : ans;
		};
		for (var s = 0; s < students.length; ++s) {
			// Fill a table row for a student.
			tr = table.AddElement('tr');
			var th = tr.AddElement('th').AddText(students[s][0][0]);
			th.title = students[s][0][1];
			th.style.color = students[s][1][0] ? '' : students[s][1][0] !== null ? 'blue' : 'grey';
			th.style.background = students[s][1][1] ? '' : 'lightgrey';
			for (var q = 2; q < students[s].length; ++q) {
				// Add all answers.
				var td = tr.AddElement('td');
				td.title = questions[q - 2][2];
				var answers = students[s][q][1];
				if (answers !== null && answers.length >= 1) {
					// There is at least one answer: fill the cell.
					// There are more answers: add the last one.
					answer = answers[answers.length - 1];
					span = td.AddText(answers.length + ':').AddElement('span').AddText(parse(answer[0]));
					for (var n = 0; n < answer[1].length; ++n)
						span.style[answer[1][n][0]] = answer[1][n][1];
					span.title = answers;
				}
				td.style.background = (students[s][q][0] ? students[s][1][1] ? 'white' : 'grey' : '');
			}
		}
	},
	student_detail: function(group, student, questions, detail) {
		// Show detailed progress for a single student.
		show('single');
		single.ClearAll();
		// TODO: show student details.
	},
	cookie: function(n, c) {
		document.cookie = 'name=' + encodeURIComponent(n);
		document.cookie = 'key=' + encodeURIComponent(c);
	},
};

function log_in() {
	var name = document.getElementById('name').value;
	var password = document.getElementById('password').value;
	server.login(name, password);
	return false;
}

function goback() {
	// Callback for the "back" button in the table view.
	server.list_groups();
}
