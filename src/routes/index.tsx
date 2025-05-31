import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Loader2, Plus } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger
} from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export const Route = createFileRoute('/')({
	component: Index
})

const taskStatuses = [
	{ id: '1', name: 'To Do', color: '#6B7280' },
	{ id: '2', name: 'In Progress', color: '#F59E0B' },
	{ id: '3', name: 'Done', color: '#10B981' }
]

function Index() {
	const tasks = useQuery(api.tasks.get)

	return (
		<div className="container mx-auto max-w-6xl p-6">
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<div className="space-y-1">
						<h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
						<p className="text-sm text-muted-foreground">
							Manage and track your tasks efficiently
						</p>
					</div>
					<div className="flex items-center gap-4">
						<span className="text-sm text-muted-foreground">
							{tasks?.length || 0} tasks
						</span>
						<Drawer>
							<DrawerTrigger asChild>
								<Button>
									<Plus className="mr-2 h-4 w-4" />
									Add Task
								</Button>
							</DrawerTrigger>
							<DrawerContent>
								<div className="mx-auto w-full max-w-sm">
									<DrawerHeader>
										<DrawerTitle>Add New Task</DrawerTitle>
										<DrawerDescription>
											Create a new task to track your progress
										</DrawerDescription>
									</DrawerHeader>
									<div className="grid gap-4 p-4">
										<div className="grid gap-2">
											<Label htmlFor="task">Task Name</Label>
											<Input
												id="task"
												placeholder="Enter your task description"
											/>
										</div>
									</div>
									<DrawerFooter>
										<Button>Create Task</Button>
										<DrawerClose asChild>
											<Button variant="outline">Cancel</Button>
										</DrawerClose>
									</DrawerFooter>
								</div>
							</DrawerContent>
						</Drawer>
					</div>
				</div>

				{!tasks ? (
					<div className="flex h-[400px] items-center justify-center rounded-lg border bg-card">
						<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
					</div>
				) : tasks.length === 0 ? (
					<div className="flex h-[400px] items-center justify-center rounded-lg border bg-card">
						<div className="text-center">
							<h3 className="text-lg font-medium">No tasks yet</h3>
							<p className="text-sm text-muted-foreground">
								Create your first task to get started
							</p>
						</div>
					</div>
				) : (
					<div className="grid grid-cols-3 gap-6">
						{taskStatuses.map((status) => (
							<div key={status.id} className="space-y-4">
								<div className="flex items-center gap-2">
									<div
										className="h-2 w-2 rounded-full"
										style={{ backgroundColor: status.color }}
									/>
									<h2 className="font-medium">{status.name}</h2>
									<span className="text-sm text-muted-foreground">
										(
										{
											tasks.filter((task) =>
												status.name === 'Done'
													? task.isCompleted
													: !task.isCompleted
											).length
										}
										)
									</span>
								</div>
								<div className="space-y-2">
									{tasks
										.filter((task) =>
											status.name === 'Done'
												? task.isCompleted
												: !task.isCompleted
										)
										.map((task) => (
											<div
												key={task._id}
												className={cn(
													'flex items-center gap-3 rounded-lg border bg-card p-4 shadow-sm transition-colors hover:bg-accent/50'
												)}>
												<Checkbox checked={task.isCompleted} />
												<span
													className={cn(
														'flex-1 text-sm',
														task.isCompleted &&
															'text-muted-foreground line-through'
													)}>
													{task.text}
												</span>
											</div>
										))}
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	)
}
