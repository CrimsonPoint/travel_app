import { useState, useEffect } from "react";
import axiosClient from "../axios-client.js";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label"
import { useStateContext  } from '../contexts/ContextProvider.jsx';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {Lock, Unlock, CheckCircle, Search} from "lucide-react";
import ForbiddenPage from "./ForbiddenPage.jsx";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [isBlockedFilter, setIsBlockedFilter] = useState("");
  const [isVerifiedFilter, setIsVerifiedFilter] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const { user, canEdit } = useStateContext();
  const [error, setError] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    roles: [],
  });
  const [roles, setRoles] = useState([]);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [tempRoles, setTempRoles] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [searchQuery, roleFilter, isBlockedFilter, isVerifiedFilter, page]);

  const fetchUsers = () => {
    setLoading(true);

    axiosClient
      .post("/users", {
        search: searchQuery,
        role: roleFilter,
        is_blocked: isBlockedFilter,
        is_verified: isVerifiedFilter,
        page,
        per_page: 10,
      })
      .then(({ data }) => {
        const normalizedUsers = (data.users || [])
          .filter(user => user && user.id && user.name)
          .map(user => ({
            ...user,
            roles: Array.isArray(user.roles) ? user.roles.filter(role => role && role.name) : [],
          }));
        setUsers(normalizedUsers);
        setPagination(data.pagination || {});
        setLoading(false);
      })
      .catch((err) => {
        setError("Не удалось загрузить пользователей");
        setLoading(false);
      });
  };

  const handleSearch = () => {
    setSearchQuery(search);
    setPage(1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const fetchRoles = () => {
    axiosClient
      .get("/roles")
      .then(({ data }) => {
        setRoles(data || []);
      })
      .catch((err) => {
        toast.error("Не удалось загрузить роли");
      });
  };

  const handleCreateUser = () => {
    axiosClient
      .post("/user", newUser)
      .then(({ data }) => {
        toast.success(data.message);
        if (data.user && data.user.id && data.user.name) {
          setUsers([{ ...data.user, roles: data.user.roles || [] }, ...users]);
        }
        setCreateModalOpen(false);
        setNewUser({ name: "", email: "", password: "", roles: [] });
      })
      .catch((err) => {
        toast.error(err.response?.data?.message ?? "Ошибка при создании пользователя");
      });
  };

  const handleUpdateRoles = (userId, selectedRoles) => {
    axiosClient
      .patch(`/users/${userId}/roles`, { roles: selectedRoles })
      .then(({ data }) => {
        toast.success(data.message);
        if (data.user && data.user.id && data.user.name) {
          setUsers(users.map((user) => (user.id === userId ? { ...data.user, roles: data.user.roles || [] } : user)));
        }
        setRoleDialogOpen(false);
      })
      .catch((err) => {
        toast.error(err.response?.data?.message ?? "Ошибка при обновлении ролей");
      });
  };

  const handleToggleBlock = (userId) => {
    axiosClient
      .patch(`/users/${userId}/block`)
      .then(({ data }) => {
        toast.success(data.message);
        if (data.user && data.user.id && data.user.name) {
          setUsers(users.map((user) => (user.id === userId ? { ...data.user, roles: data.user.roles || [] } : user)));
        } else {
          fetchUsers();
        }
      })
      .catch((err) => {
        toast.error(err.response?.data?.message ?? "Ошибка при изменении статуса блокировки");
      });
  };

  const handleVerify = (userId) => {
    axiosClient
      .patch(`/users/${userId}/verify`)
      .then(({ data }) => {
        toast.success(data.message);
        if (data.user && data.user.id && data.user.name) {
          setUsers(users.map((user) => (user.id === userId ? { ...data.user, roles: data.user.roles || [] } : user)));
        } else {
          fetchUsers();
        }
      })
      .catch((err) => {
        toast.error(err.response?.data?.message ?? "Ошибка при подтверждении пользователя");
      });
  };

  const openRoleDialog = (user) => {
    setSelectedUserId(user.id);
    setTempRoles(user.roles.map((r) => r.name));
    setRoleDialogOpen(true);
  };

  if (loading) return <div className="p-6">Загрузка...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!canEdit || !user.is_verified) return <ForbiddenPage />;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold">Управление пользователями</h1>

      <div className="flex mb-6 space-y-4 mt-10">
        <Input
          placeholder="Поиск по имени или email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          className="max-w-md"
        />
        <Button
          onClick={handleSearch}
          variant="outline"
          size="icon"
          className="shrink-0"
        >
          <Search className="h-4 w-4" />
        </Button>
        <div className="flex gap-4 ml-10">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Фильтр по роли" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все роли</SelectItem>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.name}>
                  {role.name} (уровень: {role.lvl})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={isBlockedFilter} onValueChange={setIsBlockedFilter}>
            <SelectTrigger className="w-45">
              <SelectValue placeholder="Статус блокировки" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все</SelectItem>
              <SelectItem value="true">Заблокированные</SelectItem>
              <SelectItem value="false">Незаблокированные</SelectItem>
            </SelectContent>
          </Select>
          <Select value={isVerifiedFilter} onValueChange={setIsVerifiedFilter}>
            <SelectTrigger className="w-55">
              <SelectValue placeholder="Статус подтверждения" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все</SelectItem>
              <SelectItem value="true">Подтвержденные</SelectItem>
              <SelectItem value="false">Неподтвержденные</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogTrigger asChild>
          <Button className="mb-4">Создать пользователя</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создать нового пользователя</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Имя"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            />
            <Input
              placeholder="Email"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            />
            <Input
              placeholder="Пароль"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            />
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  Выбрать роли
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Выберите роли</DialogTitle>
                </DialogHeader>
                <div className="space-y-2">
                  <Label>Выберите роль:</Label>
                  <RadioGroup
                    value={newUser.roles[0] || ""}
                    onValueChange={(value) => {
                      setNewUser({
                        ...newUser,
                        roles: [value],
                      });
                    }}
                    className="space-y-2"
                  >
                    {roles.map((role) => (
                      <div key={role.id} className="flex items-center space-x-2">
                        <RadioGroupItem data-state="checked" value={role.name} id={`new-role-${role.id}`}/>
                        <Label htmlFor={`new-role-${role.id}`}>
                          {role.name} (уровень допуска: {role.lvl})
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </DialogContent>
            </Dialog>
            <div>
              Выбранные роли: {newUser.roles.join(", ") || "Нет"}
            </div>
            <Button onClick={handleCreateUser}>Создать</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Изменить роль пользователя</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <RadioGroup
              value={tempRoles[0] || ""}
              onValueChange={(selectedRole) => {
                setTempRoles([selectedRole]);
              }}
            >
              {roles.map((role) => (
                <div key={role.id} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={role.name}
                    id={`role-${role.id}`}
                  />
                  <Label htmlFor={`role-${role.id}`}>
                    {role.name} (уровень: {role.lvl})
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <Button
            onClick={() => handleUpdateRoles(selectedUserId, tempRoles)}
            className="mt-4"
          >
            Сохранить
          </Button>
        </DialogContent>
      </Dialog>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Имя</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Роли</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name || 'Без имени'}</TableCell>
              <TableCell>{user.email || 'Без email'}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openRoleDialog(user)}
                  >
                    Изменить роль
                  </Button>
                  <span className="text-sm text-gray-500">
                    {user.role ? user.role : "Нет"}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={user.is_blocked ? "destructive" : "secondary"}>
                  {user.is_blocked ? "Заблокирован" : "Активен"}
                </Badge>
                <Badge variant={user.is_verified ? "success" : "secondary"} className="ml-2">
                  {user.is_verified ? "Подтвержден" : "Неподтвержден"}
                </Badge>
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleBlock(user.id)}
                  className="mr-2"
                >
                  {user.is_blocked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                </Button>
                {!user.is_verified && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleVerify(user.id)}
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="mt-4 flex justify-center gap-2">
        <Button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Назад
        </Button>
        <span>
          Страница {pagination.current_page || 1} из {pagination.last_page || 1}
        </span>
        <Button
          disabled={page === pagination.last_page}
          onClick={() => setPage(page + 1)}
        >
          Вперед
        </Button>
      </div>
    </div>
  );
}
