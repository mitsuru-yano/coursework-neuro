import { useEffect, useState } from 'react'
import styled from '@emotion/styled'

import { fetchHelper } from '@utils/fetchHelper'
import { Card, CardBody, CardHeading } from '@ui/Card'
import { Heading, Button, Input } from '@ui/index'
import { Modal } from '@layout/index'
import { useAuthContext } from '@context/AuthContext'

const Container = styled.div`
    display: flex;
    gap: 24px;
    max-height: 500px;
`

const ActionsList = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow-y: auto;
`

const ActionItem = styled.div`
    padding: 8px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    background-color: ${({ selected, theme }) => (selected ? '#3b82f6' : theme.palette.background.secondary)};
    color: ${({ selected }) => (selected ? '#ffffff' : '#000000')};
    display: flex;
    justify-content: space-between;
    align-items: center;

    &:hover {
        background-color: ${({ selected, theme }) => (selected ? '#3b82f6' : theme.palette.background.primary)};
    }
`

export const ActionsSettings = () => {
    const [actionsList, setActionsList] = useState([])
    const [selected, setSelected] = useState(null)
    const [modalOpen, setModalOpen] = useState(false)
    const [newActionName, setNewActionName] = useState('')
    const { token } = useAuthContext()

    // Загрузка actions из БД
    const loadActions = async () => {
        const { data, error } = await fetchHelper('/commands/actions', { token })
        if (!error && Array.isArray(data)) setActionsList(data)
    }

    useEffect(() => {
        loadActions()
    }, [token])

    // Добавление нового action
    const handleAddAction = async () => {
        if (!newActionName.trim()) return
        const { data, error } = await fetchHelper('/commands/actions', {
            method: 'POST',
            body: { name: newActionName.trim() },
            token,
        })
        if (!error) {
            await loadActions()
            setNewActionName('')
            setModalOpen(false)
        }
    }

    // Удаление action
    const handleDeleteAction = async (id) => {
        const { error } = await fetchHelper(`/commands/actions/${id}`, {
            method: 'DELETE',
            token,
        })
        if (!error) loadActions()
    }

    // Редактирование action
    const handleEditAction = async (id, newName) => {
        if (!newName.trim()) return
        const { error } = await fetchHelper(`/commands/actions/${id}`, {
            method: 'PATCH',
            body: { name: newName.trim() },
            token,
        })
        if (!error) loadActions()
    }

    return (
        <Card fullWidth>
            <CardHeading>
                <Heading as="span">Actions Settings</Heading>
            </CardHeading>
            <CardBody>
                <Container>
                    <ActionsList>
                        {actionsList.map((action) => (
                            <ActionItem
                                key={action.id}
                                selected={selected?.id === action.id}
                                onClick={() => setSelected(action)}
                            >
                                <Input
                                    label="Action"
                                    value={selected?.id === action.id ? selected.name : action.name}
                                    onChange={(e) =>
                                        setSelected((prev) =>
                                            prev?.id === action.id
                                                ? { ...prev, name: e.target.value }
                                                : prev
                                        )
                                    }
                                    onBlur={async () => {
                                        if (selected?.id === action.id)
                                            await handleEditAction(action.id, selected.name)
                                    }}
                                />
                                <Button
                                    label="Remove action"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleDeleteAction(action.id)
                                    }}
                                />
                            </ActionItem>
                        ))}
                    </ActionsList>
                </Container>

                <div style={{ marginTop: 16 }}>
                    <Button label="➕ Добавить Action" size="sm" onClick={() => setModalOpen(true)} />
                </div>

                <Modal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    header="Добавить новый Action"
                    footer={
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                            <Button label="Отмена" onClick={() => setModalOpen(false)} />
                            <Button label="Добавить" onClick={handleAddAction} />
                        </div>
                    }
                >
                    <Input
                        placeholder="Введите название действия"
                        value={newActionName}
                        onChange={(e) => setNewActionName(e.target.value)}
                        fullWidth
                    />
                </Modal>
            </CardBody>
        </Card>
    )
}
