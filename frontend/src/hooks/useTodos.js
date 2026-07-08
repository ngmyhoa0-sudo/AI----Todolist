import { useEffect, useState } from "react";
import { getTodos } from "../services/todoService";

function useTodos() {
	const [todos, setTodos] = useState([]);

	const loadTodos = async () => {
		try {
			const res = await getTodos();
			setTodos(res.data);
		} catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {
		loadTodos();
	}, []);

	return {
		todos,
		setTodos,
		loadTodos,
	};
}

export default useTodos;
