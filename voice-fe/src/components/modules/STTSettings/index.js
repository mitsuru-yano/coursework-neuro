import { useEffect, useState } from 'react'

import { fetchHelper } from '@utils/fetchHelper'

import { Card, CardBody, CardHeading } from '@ui/Card'
import { Heading, Button, Input } from '@ui/index'
import { Modal } from '@layout/index'
import { useAuthContext } from '@context/AuthContext'
import styled from '@emotion/styled'
import VoiceRecorder from 'VoiceRecorder'
import WakeAndRecord from 'WakeAndRecord'

const Container = styled.div`
    display: flex;
    gap: 24px;
    max-height: 500px;
`

const CommandsList = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow-y: auto;
`

const CommandItem = styled.div`
    padding: 8px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    background-color: ${({ selected }) => (selected ? '#3b82f6' : '#f3f4f6')};
    color: ${({ selected }) => (selected ? '#ffffff' : '#000000')};
    &:hover {
        background-color: ${({ selected }) => (selected ? '#3b82f6' : '#e5e7eb')};
    }
`

const RecorderColumn = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
`

export const STTSettings = () => {
    const [commandsList, setCommandList] = useState([])
    const [search, setSearch] = useState('')
    const [selected, setSelected] = useState(null)
    const [modalOpen, setModalOpen] = useState(false)
    const [newCommand, setNewCommand] = useState('')
    const { token } = useAuthContext()

    const [actionsList, setActionsList] = useState([]) // список actions из DB
    const [selectedAction, setSelectedAction] = useState(null) // выбранное действие
    // Загрузка actions при монтировании
    useEffect(() => {
        const loadActions = async () => {
            const { data, error } = await fetchHelper('/commands/actions', { token })
            if (!error && Array.isArray(data)) {
                setActionsList(data) // data = [{id, name}]
            }
        }
        loadActions()
    }, [token])

    // Загрузка команд из NodeJS API
    const loadCommands = async () => {
        const { data, error } = await fetchHelper('/commands/commands', { token })
        if (!error && Array.isArray(data)) {
            setCommandList(data) // data = [{id, phrase, action}]
        }
    }

    // Загрузка при монтировании
    useEffect(() => {
        loadCommands()
    }, [token])

    // Добавление новой команды
    // Добавление новой команды с action
    const handleAddCommand = async () => {
        if (!newCommand.trim()) return
        const { data, error } = await fetchHelper('/commands/commands', {
            method: 'POST',
            body: {
                phrase: newCommand.trim(),
                actionId: selectedAction?.id || null, // связка с action
            },
            token,
        })
        if (!error) {
            await loadCommands()
            setNewCommand('')
            setSelectedAction(null)
            setModalOpen(false)
        } else {
            console.error('Ошибка добавления:', error)
        }
    }

    // Удаление команды
    const handleDeleteCommand = async (id) => {
        const { error } = await fetchHelper(`/commands/commands/${id}`, {
            method: 'DELETE',
            token,
        })
        if (!error) {
            await loadCommands()
        }
    }

    // Фильтрация по поиску
    const filteredCommands = commandsList.filter(
        (cmd) => !search || cmd.phrase.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <>
            <Card fullWidth>
                <CardHeading>
                    <Heading as="span">Speech To Text Settings</Heading>
                </CardHeading>
                <CardBody>
                    <div style={{ marginBottom: 12 }}>
                        <Input
                            label="Поиск команды..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            fullWidth
                        />
                    </div>

                    <Container>
                        {/* Левая колонка — список команд */}
                        <CommandsList>
                            {filteredCommands.map((cmd) => (
                                <CommandItem
                                    key={cmd.id}
                                    selected={selected?.id === cmd.id}
                                    onClick={() => setSelected(cmd)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <span>{cmd.phrase}</span>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        {/* Выпадающий список action */}
                                        <select
                                            value={cmd.action_id || ''}
                                            onChange={async (e) => {
                                                const actionId = e.target.value
                                                    ? Number(e.target.value)
                                                    : null
                                                try {
                                                    await fetchHelper(
                                                        `/commands/commands/${cmd.id}`,
                                                        {
                                                            method: 'PATCH',
                                                            body: { actionId },
                                                            token,
                                                        }
                                                    )
                                                    // Обновляем локально список после изменения
                                                    setCommandList((prev) =>
                                                        prev.map((c) =>
                                                            c.id === cmd.id
                                                                ? {
                                                                      ...c,
                                                                      action:
                                                                          actionsList.find(
                                                                              (a) =>
                                                                                  a.id === actionId
                                                                          ) || null,
                                                                  }
                                                                : c
                                                        )
                                                    )
                                                } catch (err) {
                                                    console.error('Ошибка обновления action:', err)
                                                }
                                            }}
                                        >
                                            <option value="">— выбрать —</option>
                                            {actionsList.map((a) => (
                                                <option key={a.id} value={a.id}>
                                                    {a.name}
                                                </option>
                                            ))}
                                        </select>

                                        {/* Кнопка удаления */}
                                        <Button
                                            label="❌"
                                            size="xs"
                                            onClick={async (e) => {
                                                e.stopPropagation()
                                                try {
                                                    await fetchHelper(
                                                        `/commands/commands/${cmd.id}`,
                                                        {
                                                            method: 'DELETE',
                                                            token,
                                                        }
                                                    )
                                                    setCommandList((prev) =>
                                                        prev.filter((c) => c.id !== cmd.id)
                                                    )
                                                } catch (err) {
                                                    console.error('Ошибка удаления команды:', err)
                                                }
                                            }}
                                        />
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandsList>

                        {/* Правая колонка — запись */}
                        <RecorderColumn>
                            <VoiceRecorder command={selected?.phrase} />
                        </RecorderColumn>
                    </Container>

                    {/* Кнопка открытия модалки */}
                    <div style={{ marginTop: 16 }}>
                        <Button
                            label="➕ Добавить команду"
                            size="sm"
                            onClick={() => setModalOpen(true)}
                        />
                    </div>
                </CardBody>
                <WakeAndRecord />
                {/* Модалка */}
                <Modal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    header="Добавить новую команду"
                    footer={
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                            <Button label="Отмена" onClick={() => setModalOpen(false)} />
                            <Button label="Добавить" onClick={handleAddCommand} />
                        </div>
                    }
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <Input
                            placeholder="Введите команду"
                            value={newCommand}
                            onChange={(e) => setNewCommand(e.target.value)}
                            fullWidth
                        />
                        <label>
                            Действие:
                            <select
                                value={selectedAction?.id || ''}
                                onChange={(e) =>
                                    setSelectedAction(
                                        actionsList.find((a) => a.id === Number(e.target.value))
                                    )
                                }
                            >
                                <option value="">— выбрать —</option>
                                {actionsList.map((a) => (
                                    <option key={a.id} value={a.id}>
                                        {a.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                </Modal>
            </Card>
        </>
    )
}
