import { useEffect, useState } from 'react'
import styled from '@emotion/styled'
import { Container } from '@layout/Container'
import { Card, CardHeading, CardBody, CardFooter } from '@ui/Card'

const ModalLayout = styled(Container)`
    position: fixed;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
    background-color: rgba(22, 22, 22, 0.7);
    backdrop-filter: blur(5px);
    top: 0;
    left: 0;
    z-index: 10;
    opacity: ${({ visible }) => (visible ? 1 : 0)};
    pointer-events: ${({ visible }) => (visible ? 'all' : 'none')};
    transition: opacity 0.3s ease;
`

const AnimatedCard = styled(Card)`
    transform: ${({ visible }) => (visible ? 'scale(1)' : 'scale(0.8)')};
    opacity: ${({ visible }) => (visible ? 1 : 0)};
    transition: all 0.3s ease;
`

export const Modal = ({ open, onClose, children, header, footer }) => {
    const [visible, setVisible] = useState(false)
    const [rendered, setRendered] = useState(false)

    // Управляем анимацией
    useEffect(() => {
        if (open) {
            setRendered(true)
            setTimeout(() => setVisible(true), 10) // маленькая задержка для анимации
        } else {
            setVisible(false)
            const timer = setTimeout(() => setRendered(false), 300) // удаляем после анимации
            return () => clearTimeout(timer)
        }
    }, [open])

    if (!rendered) return null // полностью удаляем из DOM

    const handleCardClick = (e) => e.stopPropagation()

    return (
        <ModalLayout visible={visible} onClick={onClose}>
            <AnimatedCard visible={visible} onClick={handleCardClick}>
                {header && <CardHeading>{header}</CardHeading>}
                <CardBody>{children}</CardBody>
                {footer && <CardFooter>{footer}</CardFooter>}
            </AnimatedCard>
        </ModalLayout>
    )
}
